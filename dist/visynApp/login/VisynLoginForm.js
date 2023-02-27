import { ActionIcon, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { I18nextManager } from '../../i18n/I18nextManager';
export function VisynLoginForm({ onLogin }) {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
    });
    return (React.createElement("form", { onSubmit: form.onSubmit((values) => onLogin(values.username, values.password)) },
        React.createElement(Stack, null,
            React.createElement(TextInput, { placeholder: I18nextManager.getInstance().i18n.t('phovea:security_flask.username'), label: I18nextManager.getInstance().i18n.t('phovea:security_flask.username'), name: "username", autoComplete: "username", ...form.getInputProps('username'), required: true }),
            React.createElement(TextInput, { type: isShowPassword ? 'text' : 'password', placeholder: I18nextManager.getInstance().i18n.t('phovea:security_flask.password'), label: I18nextManager.getInstance().i18n.t('phovea:security_flask.password'), name: "password", autoComplete: "current-password", ...form.getInputProps('password'), rightSection: React.createElement(ActionIcon, { onClick: () => setIsShowPassword(!isShowPassword) }, isShowPassword ? React.createElement(FontAwesomeIcon, { icon: faEye }) : React.createElement(FontAwesomeIcon, { icon: faEyeSlash })), required: true })),
        React.createElement(Group, { position: "right" },
            React.createElement(Button, { fullWidth: false, mt: "md", type: "submit", className: "btn btn-primary" }, I18nextManager.getInstance().i18n.t('tdp:core.visynApp.loginButton')))));
}
//# sourceMappingURL=VisynLoginForm.js.map