import axiosInstance from "../lib/axios";

export interface Bus {
	id: string;
	number: string;
	route: string;
	status: "active" | "inactive" | "maintenance";
	currentLocation?: {
		lat: number;
		lng: number;
	};
	estimatedArrival?: string;
}

export interface Station {
	id: string;
	name: string;
	location: {
		lat: number;
		lng: number;
	};
	address: string;
	busLines: string[];
}

export interface BusSchedule {
	busId: string;
	stationId: string;
	arrivalTime: string;
	departureTime: string;
}

class BusService {
	async getBuses(): Promise<Bus[]> {
		const response = await axiosInstance.get<Bus[]>("/buses");
		return response.data;
	}

	async getBusById(id: string): Promise<Bus> {
		const response = await axiosInstance.get<Bus>(`/buses/${id}`);
		return response.data;
	}

	async getStations(): Promise<Station[]> {
		const response = await axiosInstance.get<Station[]>("/stations");
		return response.data;
	}

	async getStationById(id: string): Promise<Station> {
		const response = await axiosInstance.get<Station>(`/stations/${id}`);
		return response.data;
	}

	async getBusesByStation(stationId: string): Promise<Bus[]> {
		const response = await axiosInstance.get<Bus[]>(
			`/stations/${stationId}/buses`,
		);
		return response.data;
	}

	async getStationsByBus(busNumber: string): Promise<Station[]> {
		const response = await axiosInstance.get<Station[]>(
			`/buses/${busNumber}/stations`,
		);
		return response.data;
	}

	async getBusSchedule(stationId: string): Promise<BusSchedule[]> {
		const response = await axiosInstance.get<BusSchedule[]>(
			`/stations/${stationId}/schedule`,
		);
		return response.data;
	}

	async searchStations(query: string): Promise<Station[]> {
		const response = await axiosInstance.get<Station[]>("/stations/search", {
			params: { q: query },
		});
		return response.data;
	}

	async searchBuses(query: string): Promise<Bus[]> {
		const response = await axiosInstance.get<Bus[]>("/buses/search", {
			params: { q: query },
		});
		return response.data;
	}
}

export default new BusService();
