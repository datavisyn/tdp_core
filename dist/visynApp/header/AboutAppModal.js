import { Modal, Group, Text, Center, Divider, Space, Title } from '@mantine/core';
import React from 'react';
import { useVisynAppContext } from '../VisynAppContext';
export function AboutAppModal({ size = 'md', content, opened, onClose, dvLogo = null, customerLogo = null, }) {
    const { appName } = useVisynAppContext();
    return (React.createElement(Modal, { opened: opened, onClose: onClose, title: React.createElement(Title, { order: 4, weight: 400 }, appName), size: size },
        React.createElement(Group, { my: "md" }, content),
        process.env.__VERSION__ ? (React.createElement(React.Fragment, null,
            React.createElement(Group, { style: { gap: '4px' } },
                React.createElement(Text, { fw: 700, c: "dimmed" }, "Version:"),
                React.createElement(Text, null, process.env.__VERSION__)),
            React.createElement(Space, { h: "md" }))) : null,
        React.createElement(Divider, null),
        React.createElement(Center, { my: "md" },
            React.createElement(Text, { align: "center", color: "dimmed" },
                appName || 'This application ',
                " was developed by",
                ' ',
                React.createElement(Center, { mt: "md" },
                    customerLogo,
                    customerLogo ? React.createElement(Space, { w: "lg" }) : null,
                    dvLogo)))));
}
//# sourceMappingURL=AboutAppModal.js.map