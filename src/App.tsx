import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import AppService from "./App.service";
import BusCard from "./BusCard";
import BusInfo from "./types/BusInfo";
import BusStationInfo from "./types/BusStationInfo";
import SharePage from "./pages/SharePage";
import CustomButton from "./components/CustomButton";


const App: React.FC = () => {

	useEffect(() => {
		const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
		const themeColorMeta = document.getElementById("theme-color-meta") as HTMLMetaElement;

		const html = document.documentElement;

		if (prefersDarkMode) {
			document.documentElement.classList.add("dark");
			if (themeColorMeta) {
				themeColorMeta.content = "#0a0a0a";
				html.style.backgroundColor = "#0a0a0a";
			}
		} else {
			document.documentElement.classList.remove("dark");
			if (themeColorMeta) {
				themeColorMeta.content = "rgb(245 245 245)";
				html.style.backgroundColor = "rgb(245 245 245)";
			}
		}
	}, []);

	const [share, setShare] = useState(0);

	const handleShare = () => {
		setShare(share + 1);
	};

	useEffect(() => {
		if (share === 6) {
			setShare(0);
		}
	}, [share]);

	const [upcomingBusses, setUpcomingBusses] = useState<BusInfo[]>([]);
	const [allBusses, setAllBusses] = useState<BusInfo[]>([]);

	const [busStationInfo, setBusStationInfo] = useState<BusStationInfo>({
		id: ""
	});

	const [closestBusStations, setClosestBusStations] = useState<BusStationInfo[]>([]);

	const [lastUpdateTime, setLastUpdateTime] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [toggleLocation, setToggleLocation] = useState(false);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setBusStationInfo({
			id: value
		});
	};

	const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = event.target;
		const station = closestBusStations.find((station) => station.id === value);
		if (station) {
			setBusStationInfo({
				id: station.id,
				name: station.name
			});
		} else {
			setBusStationInfo({
				id: value
			});
		}
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

	const notify = (message: string) => {
		toast.dismiss();
		toast(
			(t) => (
				<div className="flex justify-between items-center">
					<span>
						{message}
					</span>
					<button className="p-1 ml-5" onClick={() => toast.dismiss(t.id)}>
						<svg
							className="h-5 w-5 text-neutral-900"
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
				className: "bg-neutral-300 text-neutral-900 rounded-xl text-xs"
			}
		);
	};

	const getClosestBusStations = () => {
		setIsLoading(true);

		if (toggleLocation && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				setClosestBusStations([]);
				AppService.getClosestBusStations(position.coords.latitude, position.coords.longitude).then((closestBusStations: BusStationInfo[]) => {
					if (closestBusStations.length > 0) {
						setClosestBusStations(closestBusStations);
						setBusStationInfo(closestBusStations[0]);
					} else {
						setClosestBusStations([]);
						setToggleLocation(false);
						notify("Yakında hiç otobüs durağı görünmüyor. Lütfen tekrar deneyiniz.");
						setIsLoading(false);
					}
				}).catch((error) => {
					notify(`Servis hatası: ${error}`);
					setIsLoading(false);
				});
			}, () => {
				notify("Lütfen konum servislerinin açık olduğundan emin olun.");
				setToggleLocation(false);
				setIsLoading(false);
			});
		} else {
			setToggleLocation(false);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (toggleLocation || busStationInfo.id.length === 5) {
			getUpcomingBuses();
		}
	}, [busStationInfo]);

	useEffect(() => {
		if (toggleLocation) {
			getClosestBusStations();
		}
	}, [toggleLocation]);

	const getUpcomingBuses = async () => {

		setIsLoading(true);
		setAllBusses([]);
		setUpcomingBusses([]);

		AppService.getUpcomingBuses(Number(busStationInfo.id)).then((response) => {
			if (response) {
				setUpcomingBusses(response.upcomingBusses);
				setAllBusses(response.allBusses);
			}
		}
		).catch(() => {
			notify("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
		}
		).finally(() => {
			setLastUpdateTime(new Date().toTimeString().split(" ")[0]);
			setIsLoading(false);
		});

	};

	return (
		<div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">
			<div className="container mx-auto max-w-md pt-1 pb-1 px-4 bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-300">
				<h1 className="select-none text-2xl font-bold my-5 text-center" onClick={() => handleShare()}
				>Ne Zaman Otobüs 🚌 ⏰</h1>
				{
					(share !== 5) && (
						<>
							<div className="mb-4">
								{!toggleLocation ?
									<input type="text" className="w-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300 px-3 py-3 rounded-xl appearance-none text-xs" placeholder="Durak Numarası (Örnek: 30374)" value={busStationInfo.id} onChange={handleInputChange}
									/> :
									<select
										className="w-full bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300 px-3 py-3 rounded-xl  appearance-none text-xs"
										value={busStationInfo.id}
										onChange={handleSelectChange}
									>
										<option value="">Durak Seçin</option>
										{closestBusStations.map((station) => (
											<option key={station.id} value={station.id}>
												{station.name}
											</option>
										))}
									</select>
								}
							</div>
							<div className="flex space-x-1">
								<CustomButton
									size="medium"
									rounded="xl"
									loading={isLoading}
									disabled={!validateInput()}
									onClick={() => getUpcomingBuses()}>
									Sorgula
								</CustomButton>
								<CustomButton
									variant={toggleLocation ? "success" : "secondary"}
									size="medium"
									rounded="xl"
									className="w-1/6"
									disabled={isLoading}
									onClick={() => setToggleLocation(!toggleLocation)}
								>
									<svg
										baseProfile="tiny"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-6 w-6"
									>
										<path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967L4.812 12.154c-1.001.467-.963 1.129.085 1.479L9 15l1.368 4.102z" />
									</svg>
								</CustomButton>
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
										<div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">

											<div className="flex justify-between items-baseline">
												<h2 className="text-lg font-bold mb-4">Yaklaşan Otobüsler</h2>
												{
													busStationInfo.name && (
														<span className="text-sm">{busStationInfo.name}</span>
													)

												}
											</div>
											{upcomingBusses.map((item, index) => (
												<BusCard key={index} {...item} handleClickStation={({ id, name }) => {
													setBusStationInfo({ id: id, name: name });
													setToggleLocation(false);
												}}></BusCard>
											))}
										</div>
									)
								}
								{
									allBusses.length > 0 && (
										<div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
											<div className="flex justify-between items-baseline">
												<h2 className="text-lg font-bold mb-4">Tüm Otobüsler</h2>
												{
													busStationInfo.name && (
														<span className="text-sm">{busStationInfo.name}</span>
													)

												}
											</div>					{
												allBusses.map((item, index) => (
													<BusCard key={index} {...item} handleClickStation={({ id, name }) => {
														setBusStationInfo({ id: id, name: name });
														setToggleLocation(false);
													}}></BusCard>
												))
											}
										</div>
									)
								}
								{
									(!isLoading && upcomingBusses.length === 0 && allBusses.length === 0 && lastUpdateTime !== "")
									&& (
										<>
											<div className="text-sm text-center text-red-700 mb-4">
												Veri bulunamadı. Lütfen durak numarasını kontrol edin.
											</div>
											<div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 pt-4 my-4">
												<div className="text-xs">
													Durak numarası genellikle 5 haneli bir sayıdır ve duraklarda bulunan numaralı levhalarda yazmaktadır. Durak numarası bilgisine <a className="text-blue-700" href="https://www.kocaeli.bel.tr/tr/main/hatlar">kocaeli.bel.tr</a> sitesinden de ulaşabilirsiniz.
												</div>
											</div>
										</>

									)
								}
							</div>
							<div className="text-xs border-t border-neutral-200 dark:border-neutral-800 pt-4 my-4">
								Bu uygulama Mustafa Yurdakul tarafından yapılmıştır. Kaynak kodlarına <a className="text-blue-700" href="https://github.com/mustafayurdakul/when-bus">GitHub</a> üzerinden ulaşabilirsiniz.
							</div>
						</>
					)
				}
				{
					(share === 5) && <SharePage />
				}
			</div>
			<Toaster />
		</div>
	);
};

export default App;
