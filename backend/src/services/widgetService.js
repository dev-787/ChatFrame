const WidgetConfig = require("../models/WidgetConfig");
const Tenant = require("../models/Tenant");

/**
 * Get or create widget config for a tenant.
 * On first call, seeds defaults from tenant data.
 */
const getWidgetConfig = async (tenantId) => {
  let config = await WidgetConfig.findOne({ tenantId });

  if (!config) {
    const tenant = await Tenant.findOne({ tenantId });
    config = await WidgetConfig.create({
      tenantId,
      companyName: tenant?.companyName || "",
      companyLogo: tenant?.companyLogo || null,
    });
  }

  return config;
};

/**
 * Update widget config.
 */
const updateWidgetConfig = async (tenantId, updates) => {
  const config = await WidgetConfig.findOneAndUpdate(
    { tenantId },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );
  return config;
};

/**
 * Generate the embed script snippet for a tenant's widget.
 */
const generateEmbedScript = (widgetKey, config) => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.chatframe.io' 
    : 'http://localhost:5000';
    
  return `<!-- ChatFrame Widget -->
<script>
  window.ChatFrameConfig = {
    widgetKey: "${widgetKey}",
    primaryColor: "${config.primaryColor}",
    position: "${config.widgetPosition}"
  };
  (function(d,s,id){
    var js,fjs=d.getElementsByTagName(s)[0];
    if(d.getElementById(id))return;
    js=d.createElement(s);js.id=id;
    js.src="${baseUrl}/api/widget/widget.js";
    fjs.parentNode.insertBefore(js,fjs);
  }(document,'script','chatframe-sdk'));
</script>`;
};

module.exports = { getWidgetConfig, updateWidgetConfig, generateEmbedScript };