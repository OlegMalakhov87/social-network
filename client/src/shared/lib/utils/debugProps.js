/* Функция для дебагинга пропсов, подключается если нужно*/

export const debugProps = (componentName, props) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `🔍 ${componentName}:`,
      Object.fromEntries(
        Object.entries(props).map(([key, value]) => [
          key,
          typeof value === 'function' ? '[Function]' : value,
        ])
      )
    );
  }
};
