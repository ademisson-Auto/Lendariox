import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../../contexts/AuthContext';

type FormType = 'login' | 'register';

interface AuthScreenProps {
  route?: RouteProp<RootStackParamList, 'Auth'>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ route }) => {
  const initialForm = route?.params?.initialForm || 'login';
  const [activeForm, setActiveForm] = useState<FormType>(initialForm);
  const { user } = useAuth();
  const navigation = useNavigation();

  // Redirecionar para Home se o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  }, [user, navigation]);

  // Atualizar o formulário ativo quando a rota mudar
  useEffect(() => {
    if (route?.params?.initialForm) {
      setActiveForm(route.params.initialForm);
    }
  }, [route?.params?.initialForm]);

  const toggleForm = () => {
    setActiveForm(prev => prev === 'login' ? 'register' : 'login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {activeForm === 'login' ? (
              <LoginForm onToggleForm={toggleForm} />
            ) : (
              <RegisterForm onToggleForm={toggleForm} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
});

export default AuthScreen; 