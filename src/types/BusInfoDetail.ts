export type BusInfoDetail = {
  name: string;
  stations: {
    code: string;
    name: string;
    location: string;
  }[];
};
