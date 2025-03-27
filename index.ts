import { registerRootComponent } from 'expo';
import * as Application from 'expo-application';
import { AppState, AppStateStatus } from 'react-native';
import LogManager from './src/utils/logManager';

import App from './App';

// Configuração de logs para monitorar o ciclo de vida da aplicação
class AppLifecycleLogger {
  private static instance: AppLifecycleLogger;
  private appState: AppStateStatus = AppState.currentState;
  
  private constructor() {
    this.setupListeners();
    this.logAppInfo();
  }
  
  public static getInstance(): AppLifecycleLogger {
    if (!AppLifecycleLogger.instance) {
      AppLifecycleLogger.instance = new AppLifecycleLogger();
    }
    return AppLifecycleLogger.instance;
  }
  
  private setupListeners() {
    AppState.addEventListener('change', this.handleAppStateChange);
    LogManager.info('app', 'Monitor de ciclo de vida iniciado');
  }
  
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    const prevState = this.appState;
    this.appState = nextAppState;
    
    LogManager.info('app', `Estado alterado: ${prevState} -> ${nextAppState}`);
    
    if (prevState.match(/inactive|background/) && nextAppState === 'active') {
      LogManager.info('app', 'App voltou para o primeiro plano');
    } else if (nextAppState.match(/inactive|background/) && prevState === 'active') {
      LogManager.info('app', 'App foi para o background');
    }
  }
  
  private logAppInfo() {
    try {
      LogManager.info('app', `App ID: ${Application.applicationId || 'N/A'}`);
      LogManager.info('app', `App Name: ${Application.applicationName || 'N/A'}`);
      LogManager.info('app', `App Version: ${Application.nativeApplicationVersion || 'N/A'}`);
      LogManager.info('app', `Build Version: ${Application.nativeBuildVersion || 'N/A'}`);
    } catch (error) {
      LogManager.error('app', 'Erro ao obter informações do app:', error);
    }
  }
}

// Iniciar o monitor de ciclo de vida
AppLifecycleLogger.getInstance();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
