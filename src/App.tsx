import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import BusCard from "./BusCard";

interface BusInfo {
	number: string;
	description?: string;
	remainingTime?: string;
	stopsLeft?: string;
}

interface BusStationInfo {
	id: string;
	name?: string;
}

const App: React.FC = () => {

	const [upcomingBusses, setupcomingBusses] = useState<BusInfo[]>([]);
	const [allBusses, setAllBusses] = useState<BusInfo[]>([]);

	const [busStationInfo, setBusStationInfo] = useState<BusStationInfo>({
		id: ""
	});

	const [lastUpdateTime, setLastUpdateTime] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [location, setLocation] = useState<GeolocationPosition>();

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setBusStationInfo(
			{
				id: event.target.value
			}
		);
	};

	const validateInput = () => {
		if (!busStationInfo.id || busStationInfo.id.length !== 5) {
			return false;
		}
		if (isNaN(Number(busStationInfo.id))) {
			return false;
		}
		return true;
	};

	const getLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				setLocation(position);
			}, () => {
				notify("Konum bilgisi alınamadı. Cihazınızın konum servislerinin açık olduğundan emin olun.");
			}
			);
		} else {
			notify("Tarayıcınız konum bilgisini desteklemiyor.");
		}
	};

	const getClosestStop = async (latitude: number, longitude: number) => {
		try {
			setIsLoading(true);
			const response = await axios.post(
				"https://www.e-komobil.com/yakin_duraklar.php",
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

			return {
				id: response.data["id"][0],
				name: response.data["name"][0]
			} as BusStationInfo;

		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (location) {
			const { latitude, longitude } = location.coords;
			getClosestStop(latitude, longitude).then((busStationInfo) => {
				if (busStationInfo) {
					setBusStationInfo(busStationInfo);
				}
			});

		}
	}, [location]);

	const notify = (message: string) => {
		toast.dismiss();
		toast(
			(t) => (
				<div className="flex items-center">
					<span>
						{message}
					</span>
					<button className="p-1" onClick={() => toast.dismiss(t.id)}>
						<svg
							className="h-5 w-5 text-zinc-900"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10 11.414l4.95 4.95 1.414-1.414L11.414 10l4.95-4.95L14.95 3.636 10 8.586 5.05 3.636 3.636 5.05 8.586 10l-4.95 4.95 1.414 1.414L10 11.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			),
			{
				duration: 55000,
				position: "bottom-center",
				className: "bg-neutral-300 text-zinc-900 border border-neutral-300 shadow rounded-lg text-xs"
			}
		);
	};

	const sendPostRequest = async () => {

		try {
			setIsLoading(true);
			const response = await axios.post(
				"https://www.e-komobil.com/yolcu_bilgilendirme_operations.php?cmd=searchSmartStop",
				{
					stop_id: busStationInfo.id,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}
			);

			const parser = new DOMParser();
			const doc = parser.parseFromString(response.data, "text/html");

			const yaklasanDiv = doc.getElementById("yaklasan");
			const gecenDiv = doc.getElementById("gecen");

			if (yaklasanDiv) {
				const busElements = yaklasanDiv.querySelectorAll(".row.alert-info");
				const buses: BusInfo[] = Array.from(busElements).map((busElement) => {
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

				setupcomingBusses(buses);
			}

			if (gecenDiv) {
				const busElements = gecenDiv.querySelectorAll(".row.alert-info");
				const buses: BusInfo[] = Array.from(busElements).map((busElement) => {
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

				setAllBusses(buses);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLastUpdateTime(new Date().toTimeString().split(" ")[0]);
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto max-w-md mt-10 px-4 bg-neutral-950 text-zinc-300">
			<h1 className="text-2xl font-bold my-5 text-center">Ne Zaman Otobüs 🚌 ⏰</h1>
			<div className="mb-4">
				<input
					type="text"
					className="w-full border border-neutral-900 shadow bg-neutral-900 px-3 py-2 rounded-lg"
					value={busStationInfo.id}
					placeholder="Durak Numarası (Örn: 30374)"
					onChange={handleInputChange}
				/>
			</div>
			<div className="flex justify-between items-center">
				<button
					className="bg-blue-900 hover:bg-blue-800 focus:bg-blue-900 border border-neutral-900 shadow disabled:bg-neutral-900 py-2 px-4 rounded-lg w-full mr-3"
					onClick={sendPostRequest}
					disabled={isLoading || !validateInput()}
				>
					{
						isLoading ? (
							<div className="flex items-center justify-center">
								<span className="mr-2">Yükleniyor</span>
								<svg
									className="animate-spin h-5 w-5 "
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
							</div>
						) : (
							"İstek Gönder"
						)
					}
				</button>
				<button className="bg-neutral-900 hover:bg-neutral-800 focus:bg-neutral-900 border border-neutral-900 shadow disabled:bg-neutral-900 p-2 rounded-lg"
					onClick={getLocation}
				>
					📍
				</button>
			</div>
			{
				lastUpdateTime !== "" && (upcomingBusses.length > 0 || allBusses.length > 0) && (
					<div className="text-sm text-green-700 mt-4 text-center">
						Son Güncelleme Zamanı: {lastUpdateTime}
					</div>
				)
			}
			<div className="mt-4">
				{
					upcomingBusses.length > 0 && (
						<div className="border-t border-neutral-900 shadow pt-4">

							<div className="flex justify-between items-baseline">
								<h2 className="text-lg font-bold mb-4">Yaklaşan Otobüsler</h2>
								{
									busStationInfo.name && (
										<span className="text-sm">{busStationInfo.name}</span>
									)

								}
							</div>
							{upcomingBusses.map((item, index) => (
								<BusCard key={index} {...item}></BusCard>
							))}
						</div>
					)
				}
				{
					allBusses.length > 0 && (
						<div className="border-t border-neutral-900 shadow pt-4">
							<div className="flex justify-between items-baseline">
								<h2 className="text-lg font-bold mb-4">Tüm Otobüsler</h2>
								{
									busStationInfo.name && (
										<span className="text-sm">{busStationInfo.name}</span>
									)

								}
							</div>					{
								allBusses.map((item, index) => (
									<BusCard key={index} {...item}></BusCard>
								))
							}
						</div>
					)
				}
				{
					(upcomingBusses.length === 0 && allBusses.length === 0 && lastUpdateTime !== "")
					&& (
						<>
							<div className="text-sm text-center text-red-700 mb-4">
								Veri bulunamadı. Lütfen durak numarasını kontrol edin.
							</div>
							<div className="border-t border-neutral-900 shadow pt-4 my-4">
								<div className="text-xs">
									Durak numarası genellikle 5 haneli bir sayıdır ve duraklarda bulunan numaralı levhalarda yazmaktadır. Durak numarası bilgisine <a className="text-blue-700" href="https://www.kocaeli.bel.tr/tr/main/hatlar">kocaeli.bel.tr</a> sitesinden de ulaşabilirsiniz.
								</div>
							</div>
						</>

					)
				}
			</div>
			<div className="text-xs border-t border-neutral-900 italic shadow pt-4 my-4">
				Bu uygulama Mustafa Yurdakul tarafından yapılmıştır. Kaynak kodlarına <a className="text-blue-700" href="https://github.com/mustafayurdakul/when-bus">GitHub</a> üzerinden ulaşabilirsiniz.
			</div>
			<Toaster />
		</div>
	);
};

export default App;
