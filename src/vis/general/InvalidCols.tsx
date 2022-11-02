import * as React from 'react';
import { Alert, Center, Stack } from '@mantine/core';

export function InvalidCols({ headerMessage, bodyMessage }: { headerMessage: string; bodyMessage: string }) {
  return (
    <Stack style={{ height: '100%' }}>
      <Center style={{ height: '100%', width: '100%' }}>
        <Alert title={headerMessage} color="yellow">
          {bodyMessage}
        </Alert>
      </Center>
    </Stack>
  );
}
