export function capitalize(text: string): string {
    return text.replace(/\b\w/g, function (m) {
        return m.toUpperCase();
    });
}

export function sanitazeS3Key(text: string): string {
    return decodeURIComponent(text.replace(/\+/g, ' '));
}

export const nftActive = (nfts: any) => (modelo: string, classe: string, rarity: string) => {
    console.log({ modelo, class: classe, rarity });
    const filtered = nfts
        .map((nft: any) => {
            console.log(
                { category: nft.category.toLowerCase(), class: nft.class.toLowerCase(), rarity: nft.rarity.toString() },
                { category: modelo, class: classe, rarity },
            );
            return nft;
        })
        .find(
            (nft: any) =>
                nft.category?.toLowerCase() === modelo?.toLowerCase() &&
                nft.class?.toLowerCase() === classe?.toLowerCase() &&
                nft.rarity?.toString() === rarity.toString(),
        );
    console.log('Filtered: ', filtered);
    return filtered;
};

export const generateRating = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
