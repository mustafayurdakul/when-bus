import React, { useEffect, useState } from "react";

import AppService from "./App.service";
import BusInfoDetail from "./types/BusInfoDetail";

type BusCardProps = {
	number: string;
	description?: string;
	remainingTime?: string;
	stopsLeft?: string;
	detalis?: BusInfoDetail;
};

const BusCard: React.FC<BusCardProps> = ({ number, description, remainingTime, stopsLeft, detalis }) => {

	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [busDetails, setBusDetails] = useState<BusInfoDetail[]>([]);

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
				isDetailsOpen && (
					<div className="flex flex-col border-t border-neutral-300 dark:border-neutral-700 mt-4">
						<div>
							{
								busDetails.map((detail) => (
									<div className="flex flex-col mt-4 text-xs border-b border-neutral-300 dark:border-neutral-700 pb-4" key={detail.name}>
										<span className="font-bold text-sm text-underline mb-5">{detail.name}</span>
										{
											detail.stations.map((station, index) => (
												<div className="flex flex-row justify-between text-xs mb-1" key={station.code}>
													<span>{station.name}</span>
													<span>{station.code}</span>
												</div>
											))
										}
									</div>
								))
							}
							<div>

							</div>
						</div>
						<button className="text-sm mt-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-300 p-2 rounded-xl" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
							{isDetailsOpen ? "Detayları Gizle" : "Detayları Göster"}
						</button>
					</div>
				)
			}
		</div>
	);
};

export default BusCard;