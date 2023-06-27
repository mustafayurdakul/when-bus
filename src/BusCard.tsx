import React from "react";

type BusCardProps = {
	number: string;
	description?: string;
	remainingTime?: string;
	stopsLeft?: string;
};

const BusCard: React.FC<BusCardProps> = ({ number, description, remainingTime, stopsLeft }) => {
	return (
		<div className="bg-neutral-900 border border-neutral-900 text-zinc-300 shadow p-4 rounded-lg mb-4 relative">
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
	);
};

export default BusCard;