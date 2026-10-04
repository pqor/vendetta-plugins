({
    onLoad() {
        const { findByProps, findAll } = vendetta.metro;
        const logger = vendetta.logger;
        const tag = "AgeGateSetter";

        const AGE_KEYS = [
            "ageVerificationStatus",
            "ageVerified",
            "ageVerification",
            "ageAssurance",
            "nsfwAllowed",
            "isAgeVerified",
            "isAdult",
            "isNsfw",
            "isNSFW",
        ];

        const preview = (value) => {
            if (value == null || typeof value !== "object") return value;
            if (Array.isArray(value)) return `[Array(${value.length})]`;
            const out = {};
            for (const key of AGE_KEYS) {
                if (Object.prototype.hasOwnProperty.call(value, key)) {
                    const v = value[key];
                    out[key] = typeof v === "function" ? "[Function]" : v;
                }
            }
            return Object.keys(out).length ? out : "[Object]";
        };

        logger.log(`[${tag}] Loaded. Will set ageVerificationStatus to 2 (Teen).`);
      
        let userModule = null;
        try {
            userModule = findByProps("getCurrentUser");
            if (!userModule) {
                userModule = findByProps("getCurrentUser", "getUser");
            }
        } catch (e) {
            logger.error(`[${tag}] Initial getUser module lookup failed`, e);
        }
      
        if (userModule) {
            try {
                const user = userModule.getCurrentUser?.();
                if (user) {
                    user.ageVerificationStatus = 2;
                    logger.log(`[${tag}] ageVerificationStatus set to 2. Preview:`, preview(user));
                } else {
                    logger.warn(`[${tag}] getCurrentUser() returned null – user not loaded yet.`);
                }
            } catch (e) {
                logger.error(`[${tag}] Immediate set failed`, e);
            }
        } else {
            logger.warn(`[${tag}] getUser module not found on first attempt. Will retry.`);
        }

        const MAX_ATTEMPTS = 20;
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > MAX_ATTEMPTS) {
                clearInterval(interval);
                logger.warn(`[${tag}] Gave up after ${MAX_ATTEMPTS} attempts.`);
                return;
            }

            try {
                const mod =
                    findByProps("getCurrentUser") ||
                    findByProps("getCurrentUser", "getUser");

                if (mod) {
                    const user = mod.getCurrentUser?.();
                    if (user) {
                        user.ageVerificationStatus = 2;
                        logger.log(`[${tag}] ageVerificationStatus set to 2 (attempt ${attempts}).`);
                        clearInterval(interval);
                    }
                }
            } catch (e) }
            }
        }, 500);
      
        this._pollInterval = interval;
    },

    onUnload() {
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
        }
        vendetta.logger.log(`[AgeGateSetter] Unloaded.`);
    },
})
