import axios from "axios";

import BusInfo from "../types/BusInfo";
import BusInfoDetail from "../types/BusInfoDetail";
import BusStationInfo from "../types/BusStationInfo";
import ClosestBusStationsResponse from "../types/responses/ClosestBusStationsResponse";

const url = "https://www.e-komobil.com";
const detailUrl = "https://www.kocaeli.bel.tr";

class BusService {

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

		// Fix unclosed tags
		const fixedData = data
			.replace(/<link rel="dns-prefetch" href="\/\/graph\.facebook\.com">/g, '<link rel="dns-prefetch" href="//graph.facebook.com" />')
			.replace(/<link rel="dns-prefetch" href="\/\/linkedin\.com">/g, '<link rel="dns-prefetch" href="//linkedin.com" />');
		const doc = parser.parseFromString(fixedData, "text/html");

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

	private parseBusStationDetailResponse(data: string): BusInfoDetail[] {
		const parser = new DOMParser();
		const doc = parser.parseFromString(data, "text/html");

		const stations = doc.querySelectorAll(".col-md-6"); // Select both columns containing station information

		const unwantedIndex = [0, 1]; // Unwanted indexes to be removed from the list

		if (stations.length > 0) {
			const busInfoDetails: BusInfoDetail[] = [];

			stations.forEach((station, index) => {

				if (unwantedIndex.includes(index)) {
					return;
				}

				const stationNameElement = station.querySelector("h3");
				const tableRows = station.querySelectorAll("tbody tr");

				if (stationNameElement && tableRows.length > 0) {
					const name = stationNameElement.textContent?.trim() || "";
					const stations: { code: string, name: string, location: string }[] = [];

					tableRows.forEach(row => {
						const columns = row.querySelectorAll("td");
						if (columns.length >= 3) { // Assuming each row should have at least 3 columns
							const code = columns[1].textContent?.trim() || "";
							const name = columns[2].textContent?.trim() || "";
							const locationElement = columns[2].querySelector("a");
							const location = locationElement ? locationElement.getAttribute("href") || "" : "";

							stations.push({
								code,
								name,
								location,
							});
						}
					});

					busInfoDetails.push({
						name,
						stations,
					});
				}
			});

			return busInfoDetails;
		}

		return [];
	}

	public async getBusStationDetail(station: string): Promise<BusInfoDetail[]> {

		const response = await axios.get(
			`https://net-wizard-middleware.yurdakul.keenetic.link/?url=${detailUrl}/hatlar/${station}/`
		);

		const busInfoDetail = this.parseBusStationDetailResponse(response.data);

		return busInfoDetail;
	}

}

export default new BusService();