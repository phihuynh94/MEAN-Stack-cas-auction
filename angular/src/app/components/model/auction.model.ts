export class Auction {
    _id: string;
    auctionName: string;
    maxItems: Number;
    address: string;
    dateTime: Date;
    fee: Number;
    participantID: string[];
    unorderList: string[];
    orderedList: string[];
}
