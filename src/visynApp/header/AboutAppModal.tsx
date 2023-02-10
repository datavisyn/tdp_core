import { Modal, Group, Text, Center, Divider, Space, Title, MantineNumberSize } from '@mantine/core';
import React from 'react';
import { useVisynAppContext } from '../VisynAppContext';

export interface IAboutAppModalConfig {
  content: JSX.Element;
  customerLogo?: JSX.Element;
  size?: MantineNumberSize;
}

export function AboutAppModal({
  size = 'md',
  content,
  opened,
  onClose,
  dvLogo = null,
  customerLogo = null,
}: {
  opened: boolean;
  onClose: () => void;
  dvLogo?: JSX.Element;
  customerLogo?: JSX.Element;
} & IAboutAppModalConfig) {
  const { appName } = useVisynAppContext();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Title order={4} weight={400}>
          {appName}
        </Title>
      }
      size={size}
    >
      <Group my="md">{content}</Group>
      {process.env.__VERSION__ ? (
        <>
          <Group style={{ gap: '4px' }}>
            <Text fw={700} c="dimmed">
              Version:
            </Text>
            <Text>{process.env.__VERSION__}</Text>
          </Group>
          <Space h="md" />
        </>
      ) : null}
      <Divider />
      <Center my="md">
        <Text align="center" color="dimmed">
          {appName || 'This application '} was developed by{' '}
          <Center mt="md">
            {customerLogo}
            {customerLogo ? <Space w="lg" /> : null}
            {dvLogo}
          </Center>
        </Text>
      </Center>
    </Modal>
  );
}
