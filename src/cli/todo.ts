export default function todo(screenName: string) {
  return async () => {
    console.log(`TODO: ${screenName} screen`);
  };
}
