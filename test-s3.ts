const handler = require('./src-s3/index.ts');

handler.handler([
    {
        nft: {
            tokenId: '1000',
            nftType: 'android',
            category: 'blyde',
            skills: ['Heavy Cut 1'],
            rarity: 1,
            class: 'warrior',
            wallet: 'xnahjsaionsaoaos',
        },
        openseaAttributes: {
            description: 'Universus Android',
            external_url: 'https://universus.universusgame.net/metadata/android/1000',
            image: 'https://universus-folder.universusgame.net/android/image/1000.gif',
            name: 'Blyde',
            animation_url: 'https://universus-folder.universusgame.net/android/glb/1000.glb',
            attributes: [
                {
                    trait_type: 'Rarity',
                    value: 'Common',
                },
                {
                    trait_type: 'Class',
                    value: 'Warrior',
                },
                {
                    trait_type: 'Health',
                    value: 475,
                },
                {
                    trait_type: 'Health Rating',
                    value: 2,
                },
                {
                    trait_type: 'Defense',
                    value: 39,
                },
                {
                    trait_type: 'Defense Rating',
                    value: 2,
                },
                {
                    trait_type: 'Attack',
                    value: 65,
                },
                {
                    trait_type: 'Attack Rating',
                    value: 3,
                },
                {
                    trait_type: 'Speed',
                    value: 3,
                },
                {
                    trait_type: 'Speed Rating',
                    value: 1,
                },
                {
                    trait_type: 'Intelligence',
                    value: 3,
                },
                {
                    trait_type: 'Intelligence Rating',
                    value: 1,
                },
                {
                    trait_type: 'Color 1',
                    value: 'Default',
                },
                {
                    trait_type: 'Color 2',
                    value: 'Default',
                },
                {
                    trait_type: 'Skill',
                    value: 'Heavy Cut',
                },
            ],
        },
        buckets: {
            s3BucketDefault: 'nft-universus-metadata-develop',
            bucketArt: 'nft-universus-art-2d-develop',
            bucketArtSrc: 'nft-universus-art-2d-source-develop/',
            s3KeyDefault: 'android/1000.json',
            s3GifCopyKey: 'android/image/1000.gif',
            s3GlbCopyKey: 'android/glb/1000.glb',
            keyArtSrc: 'android/gif/CardAndroidRarity0common.gif',
            keyArtGlbSrc: 'android/glb/ANDROID_common.glb',
        },
    },
]);
