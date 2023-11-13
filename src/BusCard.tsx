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
	const [busDetails, setBusDetails] = useState<BusInfoDetail[]>([]);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isDetailsOpen) {
			AppService.getBusStationDetail(number).then((res) => {
				setBusDetails(res);
			});
		} else {
			setBusDetails([]);
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
				(isDetailsOpen) && (
					!isLoading ? <div className="flex flex-col border-t border-neutral-300 dark:border-neutral-700 mt-4">
						{
							busDetails.map((detail, index) => (
								detail.stations.length > 0 && <div className="flex flex-col mt-5 text-xs border-b border-neutral-300 dark:border-neutral-700 pb-4" key={detail.name + index}>
									{
										detail.name && <span className="font-bold text-sm text-underline mb-5">{detail.name}</span>
									}
									{
										detail.stations.map((station, index) => (
											<div className="flex flex-row justify-between text-xs mb-2" key={station.code + index}>
												<span>{station.name}</span>
												<span className="font-mono">{station.code}</span>
											</div>
										))
									}
								</div>
							))
						}
						<button className="text-sm mt-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-300 p-2 rounded-xl" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
							{isDetailsOpen ? "Detayları Gizle" : "Detayları Göster"}
						</button>
					</div> :
						<div className="flex flex-row justify-center items-center mt-4">
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
				)
			}
		</div>
	);
};

export default BusCard;