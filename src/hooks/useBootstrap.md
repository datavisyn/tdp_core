## `useBootstrap`
This package allows attaching JavaScript functionality to bootstrap components. Generally, bootstrap components have to be explicitly initialized for performance reasons, which becomes cumbersome when used with another frontend-library like React. Here, you will find hooks and components to do this initialization for you, with the components also offering (a subset) of the available functions as controlled props (i.e. the `show` of a Modal).

### `useBS[Modal|...]` hooks
The hooks are designed to be uncontrolled and only give you the Modal instance. The only thing you have to do is to attach the returned ref to the `div` of the main javascript target, i.e. the `div` with the `.modal` class. For example:
```javascript
const [ref, instance] = useBSModal();

React.useEffect(() => {
  if(instance) {
    // Do something with the instance.
  }
}, [instance]);

return <div ref={ref} className="modal">...</div>;
```

### `BS[Modal|...]` components
The components are thin wrappers around the `useBS...` hooks, which allow for a more convenient way of writing components. Instead of attached the ref yourself, it automatically attaches the ref to the first child of the component. It also adds props for `show` if possible (i.e. for Modals, but not for Alerts) and syncs via `setShow`. You can also receive the instance via the `instanceRef` property.

```javascript
const [show, setShow] = React.useState<boolean>(false);

return <BSModal show={show} setShow={setShow} instanceRef={(instance) => /* Do something with the instance */}>
  <div className="modal">...</div>
</BSModal>;
```
