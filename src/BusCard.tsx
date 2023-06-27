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
			<span className="font-bold">{number}</span>
			<span className="block text-xs w-9/12 opacity-50">{description}</span>
			{stopsLeft && (
				<span className="block text-sm mt-4">
					{stopsLeft} Durak
				</span>
			)}
			{remainingTime && (
				<span className="block text-lg absolute top-1/2 right-4 transform -translate-y-1/2 opacity-75" style={{ fontSize: "64px" }}>
					{remainingTime + " '"}
				</span>
			)}
		</div>
	);
};

export default BusCard;
