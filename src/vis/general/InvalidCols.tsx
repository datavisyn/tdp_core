import * as React from 'react';
import { Container, Alert } from '@mantine/core';

export function InvalidCols({ headerMessage, bodyMessage }: { headerMessage: string; bodyMessage: string }) {
  return (
    <Container>
      <Alert title="Bummer!" color="red">
        Something terrible happened! You made a mistake and there is no going back, your data was lost forever!
      </Alert>
    </Container>
  );
}
