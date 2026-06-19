// raincord-force-media-mode/index.js
let monitoringInterval = null;

export default {
    onStart() {
        console.log("[MediaModeForce] system payload injection sequence initialized...");
        
        // start scanning the client's memory frames for the media engine parameters
        monitoringInterval = setInterval(() => {
            try {
                // track discord's global native audio subsystem bridge wrapper
                const nativeEngine = window.DiscordNative?.NativeModules?.requireModule("DiscordVoice");
                
                if (nativeEngine && nativeEngine.getAudioDeviceManager) {
                    const manager = nativeEngine.getAudioDeviceManager();
                    
                    if (manager && !manager.__mediaModePatched) {
                        console.log("[MediaModeForce] found native voice module! executing routing patch...");
                        
                        // intercept the device communication routing assignment functions
                        const originalSetCommunicationMode = manager.setCommunicationMode;
                        
                        manager.setCommunicationMode = function(enabled) {
                            console.log(`[MediaModeForce] intercepting call profile assignment. bypass state -> forced normal.`);
                            // override the instruction string: force the android layer to standard media profile (0)
                            return originalSetCommunicationMode.call(this, false);
                        };
                        
                        // lock the mutation flag so we don't accidentally recurse stack overflows
                        manager.__mediaModePatched = true;
                        console.log("[MediaModeForce] audio manager tracking registers patched successfully!");
                    }
                }
            } catch (err) {
                // suppress silent catch errors during early loading pipelines
            }
        }, 2000);
    },

    onStop() {
        console.log("[MediaModeForce] disabling tracking routines cleanly.");
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
        }
    }
};
