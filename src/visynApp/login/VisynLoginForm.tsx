import { ActionIcon, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { I18nextManager } from '../../i18n/I18nextManager';

export interface IVisynLoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
}
export function VisynLoginForm({ onLogin }: IVisynLoginFormProps) {
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onLogin(values.username, values.password))}>
      <Stack>
        <TextInput
          placeholder={I18nextManager.getInstance().i18n.t('phovea:security_flask.username')}
          label={I18nextManager.getInstance().i18n.t('phovea:security_flask.username')}
          {...form.getInputProps('username')}
          required
        />
        <TextInput
          type={isShowPassword ? 'text' : 'password'}
          placeholder={I18nextManager.getInstance().i18n.t('phovea:security_flask.password')}
          label={I18nextManager.getInstance().i18n.t('phovea:security_flask.password')}
          {...form.getInputProps('password')}
          rightSection={
            <ActionIcon onClick={() => setIsShowPassword(!isShowPassword)}>
              {isShowPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
            </ActionIcon>
          }
          required
        />
      </Stack>
      <Group position="right">
        <Button fullWidth={false} mt="md" type="submit" className="btn btn-primary">
          {I18nextManager.getInstance().i18n.t('tdp:core.visynApp.loginButton')}
        </Button>
      </Group>
    </form>
  );
}
