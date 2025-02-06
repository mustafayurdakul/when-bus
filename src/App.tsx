import { useEffect, useState } from "react";

import BusInfo from "./types/BusInfo";
import BusStationInfo from "./types/BusStationInfo";
import BusService from "./services/bus.service";
import BusInfoDetail from "./types/BusInfoDetail";


import { faBackwardStep, faForwardStep, faLocationDot, faLocationPin, faLocationPinLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function App() {

	const [upcomingBusses, setUpcomingBusses] = useState<BusInfo[]>([]);

	const [allBusses, setAllBusses] = useState<BusInfo[]>([]);

	const [busStationInfo, setBusStationInfo] = useState<BusStationInfo>({ id: "30374" });

	const [busStationDetail, setBusStationDetail] = useState<BusInfoDetail[] | null>(null);

	const [direction, setDirection] = useState(false);

	const [selectedBusStationForDetail, setSelectedBusStationForDetail] = useState("");

	const [closestBusStations, setClosestBusStations] = useState<BusStationInfo[]>([]);

	const [lastUpdateTime, setLastUpdateTime] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [toggleLocation, setToggleLocation] = useState(false);

	const getUpcomingBuses = async () => {

		setIsLoading(true);

		// Reset the lists
		setAllBusses([]);
		setUpcomingBusses([]);

		// Reset the detail
		setSelectedBusStationForDetail("");
		setBusStationDetail(null);

		BusService.getUpcomingBuses(Number(busStationInfo.id)).then((response) => {
			if (response) {
				setUpcomingBusses(response.upcomingBusses);
				setAllBusses(response.allBusses);
			}
		}
		).catch(() => {
			// notify("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
		}
		).finally(() => {
			setLastUpdateTime(new Date().toTimeString().split("")[0]);
			setIsLoading(false);
		});

	};

	const getBusStationDetail = async (stationId: string, index: number) => {

		if (selectedBusStationForDetail === stationId + index) {
			return;
		}

		setBusStationDetail(null);

		selectedBusStationForDetail === stationId + index ? setSelectedBusStationForDetail("") : setSelectedBusStationForDetail(stationId + index);

		await BusService.getBusStationDetail(stationId).then((response) => {
			setBusStationDetail(response);
		});
	};

	// If toggleLocation true call getClosestBusStations

	useEffect(() => {

		const getClosestBusStations = () => {
			setIsLoading(true);

			if (toggleLocation && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					setClosestBusStations([]);
					BusService.getClosestBusStations(position.coords.latitude, position.coords.longitude).then((closestBusStations: BusStationInfo[]) => {
						if (closestBusStations.length > 0) {
							setClosestBusStations(closestBusStations);
							setBusStationInfo(closestBusStations[0]);
						} else {
							setClosestBusStations([]);
							setToggleLocation(false);
							// notify("Yakında hiç otobüs durağı görünmüyor. Lütfen tekrar deneyiniz.");
						}
					}).catch(() => {
						// notify(`Servis hatası: ${error}`);
					}).finally(() => {
						setIsLoading(false);
					});
				}, () => {
					// notify("Lütfen konum servislerinin açık olduğundan emin olun.");
					setToggleLocation(false);
					setIsLoading(false);
				});
			} else {
				setToggleLocation(false);
				setIsLoading(false);
			}
		};

		if (toggleLocation) {
			getClosestBusStations();
		} else {
			setClosestBusStations([]);
		}
	}, [toggleLocation]);

	useEffect(() => {
		getUpcomingBuses();
	}, [busStationInfo]);

	return (
		<div className="container mx-auto max-w-md bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col space-y-5 p-5">
			<div className="space-y-2">
				<p className="text-2xl">Ne Zaman Otobüs?🚌⏰</p>
				<p className="">Bulunduğunuz yere yaklaşan otobüsleri öğrenin.</p>
			</div>
			{
				toggleLocation && closestBusStations.length > 0 ?
					<div className="flex flex-col">
						<label>En Yakın Otobüs Durakları</label>
						<select
							className="px-2 py-1 appearance-none bg-zinc-200 dark:bg-zinc-800 rounded-lg"
							disabled={isLoading}
							value={closestBusStations.find((busStation) => busStation.id === busStationInfo.id)?.id || ""}
							onChange={(e) => {
								const selectedStation = closestBusStations.find((busStation) => busStation.id === e.target.value);
								setBusStationInfo(selectedStation || { id: "" });
							}}
						>
							{closestBusStations.map((station) => (
								<option key={station.id} value={station.id}>
									{station.name} - {station.id}
								</option>
							))}
						</select>
					</div> :
					<div className="flex flex-col space-y-2">
						<label>İstasyon Kodu</label>
						<input
							type="text"
							className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
							value={busStationInfo.id}
							onChange={(e) => setBusStationInfo({ id: e.target.value })}
							placeholder="İstasyon kodunu girin (örn. 30374)."
							disabled={isLoading}
						/>
					</div>
			}

			<div className="flex justify-between items-center">
				{
					!isLoading && lastUpdateTime && <p className="text-xs">Son Güncelleme Zamanı: {lastUpdateTime}</p>
				}
				{
					isLoading && <p className="text-sm">Yükleniyor...</p>
				}
				<button onClick={() => setToggleLocation(!toggleLocation)} className="px-2 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
					{toggleLocation ? <FontAwesomeIcon icon={faLocationDot} /> : <FontAwesomeIcon icon={faLocationPinLock} />}
				</button>
			</div>

			<button className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded-lg"
				onClick={getUpcomingBuses} disabled={isLoading}>Otobüsleri Getir</button>

			{
				upcomingBusses.length > 0 &&
				<>
					<p className="text-xl">Yaklaşan Otobüsler</p>
					<div className="flex flex-col space-y-3">
						{
							upcomingBusses.map((bus, index) => (
								<div key={index} className="flex flex-col">
									<div className="p-5 flex flex-col bg-zinc-200 dark:bg-zinc-800 cursor-pointer space-y-3 rounded-lg"
										onClick={() => getBusStationDetail(bus.number, index)}>
										<div className="flex justify-between items-center">
											<div className="max-w-[75%] flex flex-col space-y-1">
												<div className="font-bold text-3xl">
													{bus.number}
												</div>
												<div className="text-sm">
													{bus.description}
												</div>
											</div>
											<div className="flex flex-col items-end">
												<div className="font-bold text-3xl">
													{bus.remainingTime} dk
												</div>
												<div className="text-xs font-mono">
													{bus.stopsLeft} Durak
												</div>
											</div>
										</div>
										{
											bus.number + index === selectedBusStationForDetail && busStationDetail &&
											<div key={index} className="flex flex-col space-y-2">
												<hr className="border-zinc-200 dark:border-zinc-700" />
												<div className="flex flex-col space-y-2">
													<div className="flex justify-between items-center">
														<div className="font-bold">
															{busStationDetail?.[direction ? 0 : 1].name}
														</div>
														<button className="px-2 py-1" onClick={() => setDirection(!direction)}>
															{direction ? <FontAwesomeIcon icon={faBackwardStep} /> : <FontAwesomeIcon icon={faForwardStep} />}
														</button>
													</div>
													{
														busStationDetail?.[direction ? 0 : 1].stations.map((station, index) => (
															<div key={index} className={`flex justify-between items-center text-xs p-3 rounded-lg ${index % 2 === 0 ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}>
																<div className="" onClick={() =>
																	window.open(`${station.location}`, "_blank")
																}>
																	{station.name}
																</div>
																<div className="font-mono">
																	{station.code}
																</div>
															</div>
														))
													}
												</div>
											</div>
										}
									</div>
								</div>
							))
						}
					</div>
				</>
			}

			{
				allBusses.length > 0 &&
				<>
					<p className="text-xl">Tüm Otobüsler</p>
					<div className="flex flex-col space-y-5">
						{
							allBusses.map((bus, index) => (
								<div key={index} className="flex flex-col">
									<div className="p-5 flex flex-col bg-zinc-200 dark:bg-zinc-800 cursor-pointer space-y-3 rounded-lg"
										onClick={() => getBusStationDetail(bus.number, index)}>
										<div className="flex justify-between items-center">
											<div className="max-w-[75%] flex flex-col space-y-1">
												<div className="font-bold text-3xl">
													{bus.number}
												</div>
												<div className="text-sm">
													{bus.description}
												</div>
												{/* <div className="text-xs font-mono">
													{bus.stopsLeft} Durak
												</div> */}
											</div>
											{/* <div className="font-bold text-3xl">
												{bus.remainingTime} dk
											</div> */}
										</div>
										{
											bus.number + index === selectedBusStationForDetail && busStationDetail &&
											<div key={index} className="flex flex-col space-y-2">
												<hr className="border-zinc-200 dark:border-zinc-700" />
												<div className="flex flex-col space-y-2">
													<div className="flex justify-between items-center">
														<div className="font-bold">
															{busStationDetail?.[direction ? 0 : 1].name}
														</div>
														<button className="px-2 py-1" onClick={() => setDirection(!direction)}>
															{direction ? <FontAwesomeIcon icon={faBackwardStep} /> : <FontAwesomeIcon icon={faForwardStep} />}
														</button>
													</div>
													{
														busStationDetail?.[direction ? 0 : 1].stations.map((station, index) => (
															<div key={index} className={`flex justify-between items-center text-xs p-3 rounded-lg ${index % 2 === 0 ? 'bg-zinc-200 dark:bg-zinc-700' : ''}`}>
																<div className="" onClick={() =>
																	window.open(`${station.location}`, "_blank")
																}>
																	{station.name}
																</div>
																<div className="font-mono">
																	{station.code}
																</div>
															</div>
														))
													}
												</div>
											</div>
										}
									</div>
								</div>
							))
						}
					</div>
				</>
			}
			<div className="flex justify-center items-center mt-5">
				<p className="text-sm">Bu uygulamayı <a className="text-blue-500" href="https://linkedin.com/in/mustafayurdakul" target="_blank" rel="noreferrer">ben</a> yaptım. Kaynak kodlarına <a className="text-blue-500" href="https://github.com/mustafayurdakul/when-bus" target="_blank" rel="noreferrer">GitHub</a> üzerinden ulaşabilirsin. 🖖</p>
			</div>
		</div >
	);
}

export default App;