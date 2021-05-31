import { ISimplePopupAuthorizationConfiguration } from '../interfaces';

export async function simplePopupFlow({
  id,
  url,
  tokenParameter,
}: ISimplePopupAuthorizationConfiguration): Promise<string> {
  console.log(`Openining popup window for ${id}`);

  const popup = window.open(
    url,
    'Authorization',
    'toolbar=no,location=no,directories=no,status=no, menubar=no,scrollbars=no,resizable=no,width=600,height=300'
  );

  return new Promise(async (resolve, reject) => {
    let i = 0;
    while (i < 200) {
      try {
        if (popup.closed) {
          reject('Window was closed before authorization was completed.');
        }
        if (popup.location.origin === window.location.origin) {
          popup.close();
          const token = new URLSearchParams(popup.location.search).get(
            tokenParameter
          );
          if (!token) {
            reject(`Token not found, return url was ${popup.location.search}.`);
          }
          resolve(token);
        }
      } catch (e) {
        console.error(e);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      i++;
    }
  });
}
