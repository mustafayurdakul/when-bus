import { Key, useEffect, useState } from "react";

import BusInfo from "./types/BusInfo";
import BusStationInfo from "./types/BusStationInfo";
import busService from "./services/bus.service";

import { Button } from "./aria-components/Button";
import { Switch } from "./aria-components/Switch";
import { Select, SelectItem } from "./aria-components/Select";
import { SearchField } from "./aria-components/SearchField";
import { GridList, GridListItem } from "./aria-components/GridList";
import { Label } from "./aria-components/Field";

function App() {

	const [upcomingBusses, setUpcomingBusses] = useState<BusInfo[]>([]);

	const [allBusses, setAllBusses] = useState<BusInfo[]>([]);

	const [busStationInfo, setBusStationInfo] = useState<BusStationInfo>({ id: "30374" });

	const [closestBusStations, setClosestBusStations] = useState<BusStationInfo[]>([]);

	const [lastUpdateTime, setLastUpdateTime] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	const [toggleLocation, setToggleLocation] = useState(false);

	const getUpcomingBuses = async () => {

		setIsLoading(true);

		// Reset the lists
		setAllBusses([]);
		setUpcomingBusses([]);

		busService.getUpcomingBuses(Number(busStationInfo.id)).then((response) => {
			if (response) {
				setUpcomingBusses(response.upcomingBusses);
				setAllBusses(response.allBusses);
			}
		}
		).catch(() => {
			// notify("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
		}
		).finally(() => {
			setLastUpdateTime(new Date().toTimeString().split(" ")[0]);
			setIsLoading(false);
		});

	};

	// If toggleLocation true call getClosestBusStations

	useEffect(() => {

		const getClosestBusStations = () => {
			setIsLoading(true);

			if (toggleLocation && navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					setClosestBusStations([]);
					busService.getClosestBusStations(position.coords.latitude, position.coords.longitude).then((closestBusStations: BusStationInfo[]) => {
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

	return (
		<div className="container mx-auto max-w-md py-5 px-5">
			<div className="flex flex-col space-y-5">

				<div className="flex justify-between items-end">
					<div className="flex flex-col space-y-1">
						<Label className="text-3xl">Ne Zaman Otobüs?</Label>
						<Label className="text-xs">Bulunduğunuz yere yaklaşan otobüsleri öğrenin.</Label>
					</div>
				</div>

				{
					toggleLocation && closestBusStations.length > 0 ?
						<Select label="En Yakın Otobüs Durakları" description="Bir istasyon seçin." items={closestBusStations} isDisabled={isLoading} selectedKey={
							closestBusStations.find((busStation) => busStation.id === busStationInfo.id)?.id || ""
						} onSelectionChange={(value: Key) => {
							setBusStationInfo(closestBusStations.find((busStation) => busStation.id === value) || { id: "" });
						}}>
							{({ name, id }) => <SelectItem>{name} - {id}</SelectItem>}
						</Select> :
						<SearchField label="İstasyon Kodu" value={busStationInfo.id} onChange={(value) => setBusStationInfo({ id: value })} description="İstasyon kodunu girin (örn. 30374)." isDisabled={isLoading} />
				}

				<div className="flex justify-between items-center">
					<Switch isSelected={toggleLocation} onChange={(value) => setToggleLocation(value)} isDisabled={isLoading}>
						Konum
					</Switch>
					{
						!isLoading && lastUpdateTime && <Label> Son Güncelleme Zamanı: {lastUpdateTime}
						</Label>
					}
					{
						isLoading && <Label> Yükleniyor...</Label>
					}
				</div>

				<Button onPress={getUpcomingBuses} isDisabled={isLoading}>Otobüsleri Getir</Button>

				{upcomingBusses.length > 0 &&
					<>
						<Label className="text-xl">Yaklaşan Otobüsler</Label>
						<GridList selectionMode="none">
							{upcomingBusses.map((bus, index) => (
								<GridListItem key={index} >
									<div className="flex justify-between items-center w-full">
										<div className="max-w-[75%] space-y-1">
											<div className="text-2xl">
												{bus.number}
											</div>
											<div className="text-xs">
												{bus.description}
											</div>
											<div className="text-xs">
												{bus.stopsLeft} Durak
											</div>
										</div>
										<div className="text-3xl">
											{bus.remainingTime} dk
										</div>
									</div>
								</GridListItem>
							))}
						</GridList>
					</>
				}


				{allBusses.length > 0 &&
					<>
						<Label className="text-xl">Tüm Otobüsler</Label>
						<GridList selectionMode="none">
							{allBusses.map((bus, index) => (
								<GridListItem key={index} >
									<div className="flex justify-between items-center w-full">
										<div>
											<div className="text-2xl">
												{bus.number}
											</div>
											<div className="text-xs">
												{bus.description}

											</div>
										</div>
									</div>

								</GridListItem>
							))}
						</GridList>
					</>
				}
			</div>
			<div className="flex justify-center items-center mt-5">
				<Label className="text-sm">Bu uygulamayı <a className="text-blue-500" href="https://linkedin.com/in/mustafayurdakul" target="_blank" rel="noreferrer">ben</a> yaptım. Kaynak kodlarına <a className="text-blue-500" href="https://github.com/mustafayurdakul/when-bus" target="_blank" rel="noreferrer">GitHub</a> üzerinden ulaşabilirsin. 🖖</Label>
			</div>
		</div >
	);
}

export default App;
