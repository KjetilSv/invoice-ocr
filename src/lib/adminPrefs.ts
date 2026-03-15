export type AdminPrefs = {
  aiEnabled: boolean;
  // If enabled, the main "Run" button uses the Local API tunnel.
  useLocalApi: boolean;
  localApiUrl: string;
  localApiKey: string;
  // Donation addresses (configurable via /admin)
  donateSol: string;
  donateAvax: string;
  donateDfk: string;
};

const KEY = 'invoiceocr_admin_prefs_v1';

export function loadAdminPrefs(): AdminPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw)
      return {
        aiEnabled: false,
        useLocalApi: false,
        localApiUrl: '',
        localApiKey: '',
        donateSol: '4NJYnpk4eLfuigUB2tbdZTY2jy45zTL8eptp1MFx8wfS',
        donateAvax: '0xab272ADCc18534a52474979aC6a6AF237553FA0e',
        donateDfk: '0xab272ADCc18534a52474979aC6a6AF237553FA0e',
      };
    const p = JSON.parse(raw) as Partial<AdminPrefs>;
    return {
      aiEnabled: !!p.aiEnabled,
      useLocalApi: !!p.useLocalApi,
      localApiUrl: typeof p.localApiUrl === 'string' ? p.localApiUrl : '',
      localApiKey: typeof p.localApiKey === 'string' ? p.localApiKey : '',
      donateSol: typeof p.donateSol === 'string' ? p.donateSol : '4NJYnpk4eLfuigUB2tbdZTY2jy45zTL8eptp1MFx8wfS',
      donateAvax: typeof p.donateAvax === 'string' ? p.donateAvax : '0xab272ADCc18534a52474979aC6a6AF237553FA0e',
      donateDfk: typeof p.donateDfk === 'string' ? p.donateDfk : '0xab272ADCc18534a52474979aC6a6AF237553FA0e',
    };
  } catch {
    return {
      aiEnabled: false,
      useLocalApi: false,
      localApiUrl: '',
      localApiKey: '',
      donateSol: '4NJYnpk4eLfuigUB2tbdZTY2jy45zTL8eptp1MFx8wfS',
      donateAvax: '0xab272ADCc18534a52474979aC6a6AF237553FA0e',
      donateDfk: '0xab272ADCc18534a52474979aC6a6AF237553FA0e',
    };
  }
}

export function saveAdminPrefs(p: AdminPrefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
