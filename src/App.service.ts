import axios from "axios";

import BusInfo from "./types/BusInfo";
import BusStationInfo from "./types/BusStationInfo";
import ClosestBusStationsResponse from "./types/responses/ClosestBusStationsResponse";

const url = "https://www.e-komobil.com";

class AppService {

	public async getClosestBusStations(latitude: number, longitude: number) {

		const response = await axios.post(
			`${url}/yakin_duraklar.php`,
			{
				func: "ns",
				lat: latitude,
				lon: longitude,
			},
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		const busStationInfoList: BusStationInfo[] = this.organizeBusStationList(response.data);

		return busStationInfoList;

	}

	private organizeBusStationList(response: ClosestBusStationsResponse): BusStationInfo[] {

		const busStationInfoList: BusStationInfo[] = [];

		for (let i = 0; i < response.name.length; i++) {
			const busStationInfo: BusStationInfo = {
				id: response.id[i],
				name: response.name[i],
			};

			busStationInfoList.push(busStationInfo);
		}

		return busStationInfoList;
	}


	public async getUpcomingBuses(stationId: number): Promise<{ upcomingBusses: BusInfo[], allBusses: BusInfo[] }> {

		const response = await axios.post(
			`${url}/yolcu_bilgilendirme_operations.php?cmd=searchSmartStop`,
			{
				stop_id: stationId,
			},
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		const { upcomingBusses, allBusses } = this.parseBusStationInfoResponse(response.data);

		return { upcomingBusses, allBusses };
	}

	private parseBusStationInfoResponse(data: string) {

		const parser = new DOMParser();
		const doc = parser.parseFromString(data, "text/html");

		const yaklasanDiv = doc.getElementById("yaklasan");
		const gecenDiv = doc.getElementById("gecen");

		let upcomingBusses: BusInfo[] = [];
		let allBusses: BusInfo[] = [];

		if (yaklasanDiv) {
			const busElements = yaklasanDiv.querySelectorAll(".row.alert-info");

			upcomingBusses = Array.from(busElements).map((busElement) => {
				const numberElement = busElement.querySelector("div > span > a");
				const number =
					numberElement?.textContent?.trim().split("-")[0] ?? "";

				const descriptionElement = busElement.querySelector(
					"div > span > a"
				);
				const description =
					descriptionElement?.textContent
						?.trim()
						.split("-")
						.slice(1)
						.join("-") ?? "";

				const timeElement = busElement.querySelector(
					"div[style*=\"background-color\"]"
				);
				const time =
					timeElement?.querySelector("span:first-child")?.textContent?.trim() ??
					"";

				const stopsElement = busElement.querySelector(
					"div[style*=\"background-color\"]"
				);
				const stops =
					stopsElement?.querySelector("span:last-child")?.textContent
						?.trim()
						.split(" ")[0] ?? "";

				return { number, description, remainingTime: time, stopsLeft: stops };
			});

		}

		if (gecenDiv) {
			const busElements = gecenDiv.querySelectorAll(".row.alert-info");
			allBusses = Array.from(busElements).map((busElement) => {
				const numberElement = busElement.querySelector("div > span > a");
				const number =
					numberElement?.textContent?.trim().split("-")[0] ?? "";

				const descriptionElement = busElement.querySelector(
					"div > span > a"
				);
				const description =
					descriptionElement?.textContent
						?.trim()
						.split("-")
						.slice(1)
						.join("-") ?? "";

				return { number, description };
			});

		}

		return { upcomingBusses, allBusses };
	}

}


export default new AppService();
