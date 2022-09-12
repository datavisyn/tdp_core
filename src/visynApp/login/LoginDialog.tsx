import { Alert, Modal, Stack, Title, Text, Center, Divider, Container } from '@mantine/core';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { VisynLoginForm } from './VisynLoginForm';
import { I18nextManager } from '../../i18n/I18nextManager';
import { LoginUtils } from '../../base/LoginUtils';

/**
 * Basic login dialog
 */
export function LoginDialog({
  show = false,
  hasWarning,
  hasError,
  setError,
  appName,
}: {
  /**
   * Open dialog by default
   */
  show?: boolean;
  /**
   * Adds has-warning css class
   */
  hasWarning?: boolean;

  /**
   * Adds the `has-error` css class
   */
  hasError?: boolean;
  setError: (s: string) => void;
  appName: string;
}) {
  return (
    <Modal withCloseButton={false} opened={show} onClose={() => null} title={null}>
      <Container fluid>
        <Stack>
          <Center>
            <Title order={4}>{`Welcome to ${appName}`}</Title>
          </Center>
          <Divider />
          <Center>
            <Text mb="lg">Please log in to continue</Text>
          </Center>
        </Stack>
      </Container>
      <Stack>
        {hasError ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} title="Error" color="red" radius="md">
            {I18nextManager.getInstance().i18n.t('phovea:security_flask.alertWrongCredentials')}
          </Alert>
        ) : null}
        {hasWarning ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} title="Warning" color="yellow" radius="md">
            {I18nextManager.getInstance().i18n.t('phovea:security_flask.alertOffline')}
          </Alert>
        ) : null}
        <VisynLoginForm
          onLogin={async (username: string, password: string) => {
            setError(null);
            return LoginUtils.login(username, password).catch((e) => {
              if (e.response && e.response.status !== 401) {
                // 401 = Unauthorized
                // server error
                setError('not_reachable');
              } else {
                setError(e);
              }
            });
          }}
        />
      </Stack>
    </Modal>
  );
}
