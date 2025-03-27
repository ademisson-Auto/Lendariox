// Resolve conflitos entre as definições de tipos da biblioteca DOM e React Native
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__: any;
}

// Desativa as definições de tipos DOM para estes elementos que conflitam com React Native
interface FormDataValue {}
interface FormData {}
interface URL {}
interface URLSearchParams {}
interface RequestInfo {}
interface XMLHttpRequestResponseType {}
interface AbortSignal {} 