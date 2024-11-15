import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navigation from './src/Navigation';
import { ClientProvider } from './src/context/ClientContext';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import BackupService from './src/services/BackupService';
import { StyleSheet, View, Text } from 'react-native';
import { LoadingSpinner } from './src/components/ui/LoadingSpinner';

SystemNavigationBar.setNavigationColor('#FFF', 'dark');

export default function App() {
  const [isLoading, setisLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setisLoading(false)
    }, 2000);
  }, []);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" backgroundColor="#fff" />
        <ClientProvider>
          <BackupService />
          <Navigation />
        </ClientProvider>
      </SafeAreaView>
      {isLoading &&(
        <View style={styles.loadingView}>
          <LoadingSpinner />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    position: 'absolute',
    height: '100%',
    width: '100%'
  }
})