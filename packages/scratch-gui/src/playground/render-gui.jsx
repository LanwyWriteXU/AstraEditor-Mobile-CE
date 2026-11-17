import React from 'react';
import GUI from '../containers/gui.jsx';

const searchParams = new URLSearchParams(location.search);
const cloudHost = searchParams.get('cloud_host') || 'wss://clouddata.turbowarp.org';

const RenderGUI = (props) => (
  <GUI
    cloudHost={cloudHost}
    canUseCloud
    hasCloudPermission
    canSave={false}
    basePath={process.env.ROOT}
    backpackVisible
    backpackHost="_local_"
    canEditTitle
    enableCommunity
    {...props}
  />
);

export default RenderGUI;
