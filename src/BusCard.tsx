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
										<div className="flex space-x-1 cursor-pointer" onClick={() => { setDestinationIndex(!destinationIndex); }}>
											<span className="font-bold text-sm text-underline mb-5" >{firstDestination.name}</span>
											<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-neutral-900 dark:text-neutral-300">
												<path opacity="0.5" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
												<path d="M13.5303 8.46967C13.2374 8.17678 12.7626 8.17678 12.4697 8.46967C12.1768 8.76256 12.1768 9.23744 12.4697 9.53033L14.1893 11.25H8C7.58579 11.25 7.25 11.5858 7.25 12C7.25 12.4142 7.58579 12.75 8 12.75H14.1893L12.4697 14.4697C12.1768 14.7626 12.1768 15.2374 12.4697 15.5303C12.7626 15.8232 13.2374 15.8232 13.5303 15.5303L16.5303 12.5303C16.8232 12.2374 16.8232 11.7626 16.5303 11.4697L13.5303 8.46967Z" />
											</svg>
										</div>

										<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-neutral-900 dark:text-neutral-300">
											<path d="M12 2C16.714 2 19.0711 2 20.5355 3.46447C21.0394 3.96833 21.3699 4.57786 21.5867 5.3527L5.3527 21.5867C4.57786 21.3699 3.96833 21.0394 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2ZM5.5 8.75732C5.5 10.5422 6.61708 12.625 8.35997 13.3698C8.76626 13.5434 9.23374 13.5434 9.64003 13.3698C11.3829 12.625 12.5 10.5422 12.5 8.75732C12.5 6.95835 10.933 5.5 9 5.5C7.067 5.5 5.5 6.95835 5.5 8.75732Z" />
											<path d="M10.5 9C10.5 9.82843 9.82843 10.5 9 10.5C8.17157 10.5 7.5 9.82843 7.5 9C7.5 8.17157 8.17157 7.5 9 7.5C9.82843 7.5 10.5 8.17157 10.5 9Z" />
											<g opacity="0.5">
												<path d="M21.8893 7.17188C22.0002 8.43338 22.0002 10.0059 22.0002 12.0002C22.0002 16.1339 22.0002 18.4552 21.0128 19.9515L15.0613 14L21.8893 7.17188Z" />
												<path d="M19.9523 21.0123L14.0006 15.0607L7.17188 21.8893C8.43338 22.0002 10.0059 22.0002 12.0002 22.0002C16.1346 22.0002 18.4559 22.0002 19.9523 21.0123Z" />
											</g>
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
											<div className="flex space-x-1 cursor-pointer" onClick={() => { setDestinationIndex(!destinationIndex); }}>
												<span className="font-bold text-sm text-underline mb-5">{secondDestination.name}</span>
												<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-neutral-900 dark:text-neutral-300">
													<path opacity="0.5" d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z" />
													<path d="M10.4697 8.46967C10.7626 8.17678 11.2374 8.17678 11.5303 8.46967C11.8232 8.76256 11.8232 9.23744 11.5303 9.53033L9.81066 11.25H16C16.4142 11.25 16.75 11.5858 16.75 12C16.75 12.4142 16.4142 12.75 16 12.75H9.81066L11.5303 14.4697C11.8232 14.7626 11.8232 15.2374 11.5303 15.5303C11.2374 15.8232 10.7626 15.8232 10.4697 15.5303L7.46967 12.5303C7.17678 12.2374 7.17678 11.7626 7.46967 11.4697L10.4697 8.46967Z" />
												</svg>
											</div>

											<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-neutral-900 dark:text-neutral-300">
												<path d="M12 2C16.714 2 19.0711 2 20.5355 3.46447C21.0394 3.96833 21.3699 4.57786 21.5867 5.3527L5.3527 21.5867C4.57786 21.3699 3.96833 21.0394 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2ZM5.5 8.75732C5.5 10.5422 6.61708 12.625 8.35997 13.3698C8.76626 13.5434 9.23374 13.5434 9.64003 13.3698C11.3829 12.625 12.5 10.5422 12.5 8.75732C12.5 6.95835 10.933 5.5 9 5.5C7.067 5.5 5.5 6.95835 5.5 8.75732Z" />
												<path d="M10.5 9C10.5 9.82843 9.82843 10.5 9 10.5C8.17157 10.5 7.5 9.82843 7.5 9C7.5 8.17157 8.17157 7.5 9 7.5C9.82843 7.5 10.5 8.17157 10.5 9Z" />
												<g opacity="0.5">
													<path d="M21.8893 7.17188C22.0002 8.43338 22.0002 10.0059 22.0002 12.0002C22.0002 16.1339 22.0002 18.4552 21.0128 19.9515L15.0613 14L21.8893 7.17188Z" />
													<path d="M19.9523 21.0123L14.0006 15.0607L7.17188 21.8893C8.43338 22.0002 10.0059 22.0002 12.0002 22.0002C16.1346 22.0002 18.4559 22.0002 19.9523 21.0123Z" />
												</g>
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
