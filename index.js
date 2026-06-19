let monitoringInterval = null;

export default {
    onStart() {
        console.log("[MediaModeForce] starting patch...");
        
        // find the media engine
        monitoringInterval = setInterval(() => {
            try {
                // track discord's global native audio subsystem bridge wrapper
                const nativeEngine = window.DiscordNative?.NativeModules?.requireModule("DiscordVoice");
                
                if (nativeEngine && nativeEngine.getAudioDeviceManager) {
                    const manager = nativeEngine.getAudioDeviceManager();
                    
                    if (manager && !manager.__mediaModePatched) {
                        console.log("[ForceMediaMode] found the media engine!");
                        
                        // intercept the device communication routing assignment functions
                        const originalSetCommunicationMode = manager.setCommunicationMode;
                        
                        manager.setCommunicationMode = function(enabled) {
                            console.log(`[ForceMediaMode] changing communication mode...`);
                            // override the instruction string: force the android layer to standard media profile (0)
                            return originalSetCommunicationMode.call(this, false);
                        };
                        
                        // lock the mutation flag so we don't accidentally recurse stack overflows
                        manager.__mediaModePatched = true;
                        console.log("[ForceMediaMode] done!");
                    }
                }
            } catch (err) {
                // suppress silent catch errors during early loading pipelines
            }
        }, 2000);
    },

    onStop() {
        console.log("[ForceMediaMode] disabling plugin...");
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
        }
    }
};
