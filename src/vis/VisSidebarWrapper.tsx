import { Container, Drawer } from '@mantine/core';
import * as React from 'react';
import { ReactNode, useRef } from 'react';

export function VisSidebarWrapper({
  id,
  children,
  open = true,
  target,
  onClose,
}: {
  id: string;
  children: ReactNode;
  open?: boolean;
  target: HTMLElement;
  onClose: () => void;
}) {
  return (
    <Drawer
      closeOnClickOutside
      padding="sm"
      lockScroll={false}
      overlayOpacity={0}
      styles={{ drawer: { position: 'absolute', overflow: 'auto' }, root: { position: 'absolute', padding: 0 }, header: { margin: 0 } }}
      withinPortal
      position="right"
      shadow="xl"
      target={target}
      opened={open}
      onClose={() => onClose()}
      size="sm"
    >
      {children}
    </Drawer>
  );
}
