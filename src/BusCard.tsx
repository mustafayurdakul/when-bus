import React, { useEffect, useState } from "react";

import AppService from "./App.service";
import BusInfoDetail from "./types/BusInfoDetail";

type BusCardProps = {
	number: string;
	description?: string;
	remainingTime?: string;
	stopsLeft?: string;
};

const BusCard: React.FC<BusCardProps> = ({ number, description, remainingTime, stopsLeft }) => {

	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	const [firstDestination, setFirstDestination] = useState<BusInfoDetail>();
	const [secondDestination, setSecondDestination] = useState<BusInfoDetail>();

	const [destinationIndex, setDestinationIndex] = useState(true);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isDetailsOpen) {
			setIsLoading(true);
			AppService.getBusStationDetail(number).then((response: BusInfoDetail[]) => {
				setFirstDestination(response[0]);
				setSecondDestination(response[1]);
			}).finally(() => {
				setIsLoading(false);
			});
		} else {
			setIsLoading(false);
			setFirstDestination(undefined);
			setSecondDestination(undefined);
		}
	}, [isDetailsOpen]);

	return (
		<div className="bg-neutral-200 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-300 p-4 rounded-xl mb-4">
			<div className="flex flex-row justify-between relative" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
				<div className="flex flex-col w-9/12">
					<span className="font-bold text-lg">{number}</span>
					<span className="text-xs opacity-75">{description}</span>
					{
						stopsLeft && (
							<span className="text-sm mt-4">
								{stopsLeft} Durak
							</span>
						)
					}
				</div>
				{
					remainingTime && (
						<div className="flex flex-col">
							<span className="block absolute top-1/2 right-5 transform -translate-y-1/2" style={{ fontSize: "64px" }}>
								{remainingTime}
								<span className="text-base">dk</span>
							</span>
						</div>
					)
				}
			</div>
			{
				isDetailsOpen && (
					isLoading ? <div className="flex flex-row justify-center items-center mt-4">
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
					</div> : <div className="flex flex-col border-t border-neutral-300 dark:border-neutral-700 mt-4">
						{
							destinationIndex ? (firstDestination && firstDestination.stations.length > 0) && <div className="flex flex-col mt-5 text-xs border-b border-neutral-300 dark:border-neutral-700 pb-4">
								{
									firstDestination.name && <div className="flex flex-row justify-between">
										<span className="font-bold text-sm text-underline mb-5" onClick={() => { setDestinationIndex(!destinationIndex); }}>{firstDestination.name}</span>
										<svg
											baseProfile="tiny"
											viewBox="0 0 24 24"
											fill="#e74c3c"
											className="h-5 w-5"
										>
											<path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967L4.812 12.154c-1.001.467-.963 1.129.085 1.479L9 15l1.368 4.102z" />
										</svg>
									</div>
								}
								{
									firstDestination.stations.map((station, index) => (
										<div className="flex flex-row justify-between text-xs mb-3" key={station.code + index}>
											<span>{station.name}</span>
											<span className="font-mono cursor-pointer text-neutral-400 dark:text-neutral-500" onClick={() => { window.open(station.location); }}>{station.code}</span>
										</div>
									))
								}
							</div> :
								(secondDestination && secondDestination.stations.length > 0) && <div className="flex flex-col mt-5 text-xs border-b border-neutral-300 dark:border-neutral-700 pb-4">
									{
										secondDestination.name && <div className="flex flex-row justify-between">
											<span className="font-bold text-sm text-underline mb-5" onClick={() => { setDestinationIndex(!destinationIndex); }}>{secondDestination.name}</span>
											<svg
												baseProfile="tiny"
												viewBox="0 0 24 24"
												fill="#e74c3c"
												className="h-5 w-5"
											>
												<path d="M10.368 19.102c.349 1.049 1.011 1.086 1.478.086l5.309-11.375c.467-1.002.034-1.434-.967-.967L4.812 12.154c-1.001.467-.963 1.129.085 1.479L9 15l1.368 4.102z" />
											</svg>
										</div>
									}
									{
										secondDestination.stations.map((station, index) => (
											<div className="flex flex-row justify-between text-xs mb-3" key={station.code + index}>
												<span>{station.name}</span>
												<span className="font-mono cursor-pointer text-neutral-400 dark:text-neutral-500" onClick={() => { window.open(station.location); }}>{station.code}</span>
											</div>
										))
									}
								</div>
						}
						<button className="text-sm mt-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-300 p-2 rounded-xl" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
							Detayları Gizle
						</button>
					</div>
				)
			}
		</div>
	);
};

export default BusCard;
