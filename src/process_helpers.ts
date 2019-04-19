import readline from 'readline';

export const setCleanupActions = (
  shutdownActions: Array<() => void>
): void => {

  const shutdown = () => {
    console.error('\n[NODE]', 'Caught SIGINT; shutting down servers.');

    for (let actionToPerform of shutdownActions) {
      actionToPerform();
    }

    // this line below is what the big block comment above is talking about
    process.exit(0); // <-- DO NOT DELETE THIS LINE
  };

  process.on('SIGINT', shutdown);
};
