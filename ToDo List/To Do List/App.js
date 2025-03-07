import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from './firebaseConfig';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function TaskListScreen({ navigation }) {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'incomplete'

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tasks"), snapshot => {
      const loadedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        text: doc.data().text || '',
        description: doc.data().description || '',
        done: doc.data().done || false,
      }));
      setTasks(loadedTasks);
    });
    return unsubscribe;
  }, []);

  const addTask = async () => {
    if (task.trim()) {
      try {
        await addDoc(collection(db, "tasks"), {
          text: task.trim(),
          description: '',
          done: false,
        });
        setTask('');
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    }
  };

  const toggleTaskCompletion = async (id, done) => {
    try {
      const taskDoc = doc(db, "tasks", id);
      await updateDoc(taskDoc, { done: !done });
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const taskDoc = doc(db, "tasks", id);
      await deleteDoc(taskDoc);
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'done') return task.done;
    if (filter === 'nodone') return !task.done;
    return true; // 'all'
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Go To Your Dreams</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'done' && styles.activeFilterButton]}
          onPress={() => setFilter('done')}
        >
          <Text style={[styles.filterButtonText, filter === 'done' && styles.activeFilterButtonText]}>
            Done
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'nodone' && styles.activeFilterButton]}
          onPress={() => setFilter('nodone')}
        >
          <Text style={[styles.filterButtonText, filter === 'nodone' && styles.activeFilterButtonText]}>
            No Done
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              style={[styles.checkbox, item.done && styles.checkedCheckbox]}
              onPress={() => toggleTaskCompletion(item.id, item.done)}
            />
            <TouchableOpacity
              style={styles.taskContainer}
              onPress={() => navigation.navigate('Edit Task', {
                taskId: item.id,
                currentText: item.text,
                currentDescription: item.description,
              })}
            >
              <Text style={[styles.taskText, item.done && styles.doneTask]}>{item.text || 'No task text'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

function EditTaskScreen({ route, navigation }) {
  const { taskId, currentText, currentDescription } = route.params;
  const [newText, setNewText] = useState(currentText);
  const [newDescription, setNewDescription] = useState(currentDescription);

  const updateTask = async () => {
    try {
      const taskDoc = doc(db, "tasks", taskId);
      await updateDoc(taskDoc, { text: newText, description: newDescription });
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  return (
    <View style={styles.editContainer}>
      <TextInput
        style={styles.editInput}
        value={newText}
        onChangeText={setNewText}
        placeholder="Edit your task title"
      />
      <TextInput
        style={styles.editInput}
        value={newDescription}
        onChangeText={setNewDescription}
        placeholder="Add your task description"
        multiline
      />
      <TouchableOpacity style={styles.updateButton} onPress={updateTask}>
        <Text style={styles.updateButtonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Task List">
        <Stack.Screen name="Task List" component={TaskListScreen} />
        <Stack.Screen name="Edit Task" component={EditTaskScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9ECF5',
    paddingTop: 25,
    paddingHorizontal: 25,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#13212C',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#565154',
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#05668D',
    borderRadius: 10,
    padding: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#D1D4DF',
  },
  activeFilterButton: {
    backgroundColor: '#607196',
  },
  filterButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeFilterButtonText: {
    color: '#fff',
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#BBBBBB',
    borderRadius: 3,
    marginRight: 10,
  },
  checkedCheckbox: {
    backgroundColor: '#019B94',
  },
  taskContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
  },
  doneTask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    color: '#BF1019',
    fontWeight: 'bold',
  },
  editContainer: {
    flex: 1,
    padding: 20,
  },
  editInput: {
    borderColor: '#565154',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 18,
  },
  updateButton: {
    backgroundColor: '#05668D',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppNavigator;