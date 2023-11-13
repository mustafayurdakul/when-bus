type BusInfoDetail = {
	name: string;
	stations: {
		code: string,
		name: string
	}[]
}

export default BusInfoDetail;