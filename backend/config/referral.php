<?php

return [

    // Percentage of a referred user's first paid order that gets credited
    // to the referrer's wallet as a reward.
    'reward_percentage' => (float) env('REFERRAL_REWARD_PERCENTAGE', 10),

];
