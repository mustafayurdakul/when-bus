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
										<div className="flex space-x-1" onClick={() => { setDestinationIndex(!destinationIndex); }}>
											<span className="font-bold text-sm text-underline mb-5" >{firstDestination.name}</span>
											<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
												<path opacity="0.5" d="M12 2C10.2843 2 8.90356 3.38071 6.14214 6.14214C3.38071 8.90356 2 10.2843 2 12C2 13.7157 3.38071 15.0964 6.14214 17.8579C8.90356 20.6193 10.2843 22 12 22C13.7157 22 15.0964 20.6193 17.8579 17.8579C20.6193 15.0964 22 13.7157 22 12C22 10.2843 20.6193 8.90356 17.8579 6.14214C15.0964 3.38071 13.7157 2 12 2Z" fill="#1C274C" />
												<path d="M12.7862 8.48705C13.0695 8.18486 13.5441 8.16955 13.8463 8.45285L16.513 10.9528C16.6642 11.0946 16.75 11.2927 16.75 11.5C16.75 11.7073 16.6642 11.9054 16.513 12.0472L13.8463 14.5472C13.5441 14.8305 13.0695 14.8151 12.7862 14.513C12.5029 14.2108 12.5182 13.7361 12.8204 13.4528L14.1034 12.25H10.6667C10.3329 12.25 9.8225 12.3497 9.4196 12.6216C9.05681 12.8665 8.75 13.2655 8.75 14C8.75 14.4142 8.41421 14.75 8 14.75C7.58579 14.75 7.25 14.4142 7.25 14C7.25 12.7345 7.83208 11.8835 8.5804 11.3784C9.28861 10.9003 10.1116 10.75 10.6667 10.75L14.1034 10.75L12.8204 9.54716C12.5182 9.26386 12.5029 8.78923 12.7862 8.48705Z" fill="#1C274C" />
											</svg>
										</div>

										<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
											<path d="M12 2C16.714 2 19.0711 2 20.5355 3.46447C21.0394 3.96833 21.3699 4.57786 21.5867 5.3527L5.3527 21.5867C4.57786 21.3699 3.96833 21.0394 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2ZM5.5 8.75732C5.5 10.5422 6.61708 12.625 8.35997 13.3698C8.76626 13.5434 9.23374 13.5434 9.64003 13.3698C11.3829 12.625 12.5 10.5422 12.5 8.75732C12.5 6.95835 10.933 5.5 9 5.5C7.067 5.5 5.5 6.95835 5.5 8.75732Z" fill="#1C274C" />
											<path d="M10.5 9C10.5 9.82843 9.82843 10.5 9 10.5C8.17157 10.5 7.5 9.82843 7.5 9C7.5 8.17157 8.17157 7.5 9 7.5C9.82843 7.5 10.5 8.17157 10.5 9Z" fill="#1C274C" />
											<g opacity="0.5">
												<path d="M21.8893 7.17188C22.0002 8.43338 22.0002 10.0059 22.0002 12.0002C22.0002 16.1339 22.0002 18.4552 21.0128 19.9515L15.0613 14L21.8893 7.17188Z" fill="#1C274C" />
												<path d="M19.9523 21.0123L14.0006 15.0607L7.17188 21.8893C8.43338 22.0002 10.0059 22.0002 12.0002 22.0002C16.1346 22.0002 18.4559 22.0002 19.9523 21.0123Z" fill="#1C274C" />
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
											<div className="flex space-x-1" onClick={() => { setDestinationIndex(!destinationIndex); }}>
												<span className="font-bold text-sm text-underline mb-5">{secondDestination.name}</span>
												<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
													<path opacity="0.5" d="M12 2C10.2843 2 8.90356 3.38071 6.14214 6.14214C3.38071 8.90356 2 10.2843 2 12C2 13.7157 3.38071 15.0964 6.14214 17.8579C8.90356 20.6193 10.2843 22 12 22C13.7157 22 15.0964 20.6193 17.8579 17.8579C20.6193 15.0964 22 13.7157 22 12C22 10.2843 20.6193 8.90356 17.8579 6.14214C15.0964 3.38071 13.7157 2 12 2Z" fill="#1C274C" />
													<path d="M12.7862 8.48705C13.0695 8.18486 13.5441 8.16955 13.8463 8.45285L16.513 10.9528C16.6642 11.0946 16.75 11.2927 16.75 11.5C16.75 11.7073 16.6642 11.9054 16.513 12.0472L13.8463 14.5472C13.5441 14.8305 13.0695 14.8151 12.7862 14.513C12.5029 14.2108 12.5182 13.7361 12.8204 13.4528L14.1034 12.25H10.6667C10.3329 12.25 9.8225 12.3497 9.4196 12.6216C9.05681 12.8665 8.75 13.2655 8.75 14C8.75 14.4142 8.41421 14.75 8 14.75C7.58579 14.75 7.25 14.4142 7.25 14C7.25 12.7345 7.83208 11.8835 8.5804 11.3784C9.28861 10.9003 10.1116 10.75 10.6667 10.75L14.1034 10.75L12.8204 9.54716C12.5182 9.26386 12.5029 8.78923 12.7862 8.48705Z" fill="#1C274C" />
												</svg>
											</div>

											<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
												<path d="M12 2C16.714 2 19.0711 2 20.5355 3.46447C21.0394 3.96833 21.3699 4.57786 21.5867 5.3527L5.3527 21.5867C4.57786 21.3699 3.96833 21.0394 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2ZM5.5 8.75732C5.5 10.5422 6.61708 12.625 8.35997 13.3698C8.76626 13.5434 9.23374 13.5434 9.64003 13.3698C11.3829 12.625 12.5 10.5422 12.5 8.75732C12.5 6.95835 10.933 5.5 9 5.5C7.067 5.5 5.5 6.95835 5.5 8.75732Z" fill="#1C274C" />
												<path d="M10.5 9C10.5 9.82843 9.82843 10.5 9 10.5C8.17157 10.5 7.5 9.82843 7.5 9C7.5 8.17157 8.17157 7.5 9 7.5C9.82843 7.5 10.5 8.17157 10.5 9Z" fill="#1C274C" />
												<g opacity="0.5">
													<path d="M21.8893 7.17188C22.0002 8.43338 22.0002 10.0059 22.0002 12.0002C22.0002 16.1339 22.0002 18.4552 21.0128 19.9515L15.0613 14L21.8893 7.17188Z" fill="#1C274C" />
													<path d="M19.9523 21.0123L14.0006 15.0607L7.17188 21.8893C8.43338 22.0002 10.0059 22.0002 12.0002 22.0002C16.1346 22.0002 18.4559 22.0002 19.9523 21.0123Z" fill="#1C274C" />
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
