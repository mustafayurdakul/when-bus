import axios from "axios";
import React, { useState } from "react";

interface BusInfo {
	number: string;
	description?: string;
	remainingTime?: string;
	stopsLeft?: string;
}

const App: React.FC = () => {

	const [yaklasanBuses, setYaklasanBuses] = useState<BusInfo[]>([]);
	const [gecenBuses, setGecenBuses] = useState<BusInfo[]>([]);

	const [inputValue, setInputValue] = useState("");
	const [lastUpdateTime, setLastUpdateTime] = useState("");


	const [isLoading, setIsLoading] = useState(false);

	const [errorMessage, setErrorMessage] = useState("");

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const sendPostRequest = async () => {
		try {
			setIsLoading(true); // Set isLoading to true while loading data
			const response = await axios.post(
				"https://www.e-komobil.com/yolcu_bilgilendirme_operations.php?cmd=searchSmartStop",
				{
					stop_id: inputValue,
				},
				{
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				}
			);


			const parser = new DOMParser();
			const doc = parser.parseFromString(response.data, "text/html");

			const yaklasanDiv = doc.getElementById("yaklasan");
			const gecenDiv = doc.getElementById("gecen");

			if (yaklasanDiv) {

				const busElements = yaklasanDiv.querySelectorAll(".row.alert-info");
				const buses: BusInfo[] = Array.from(busElements).map((busElement) => {
					const numberElement = busElement.querySelector("div > span > a");
					const number = numberElement?.textContent?.trim().split("-")[0] ?? "";
					// Example 503-KENTÖNÜ-GEBZE TEKNİK ÜNİ.-NENEHATUN-İSTASYON-FATİH DH.
					// Bus number is 503
					// Bus description is KENTÖNÜ-GEBZE TEKNİK ÜNİ.-NENEHATUN-İSTASYON-FATİH DH.

					const descriptionElement = busElement.querySelector("div > span > a");
					const description = descriptionElement?.textContent?.trim().split("-").slice(1).join("-") ?? "";

					const timeElement = busElement.querySelector("div[style*=\"background-color\"]");
					const time = timeElement?.querySelector("span:first-child")?.textContent?.trim() ?? "";

					const stopsElement = busElement.querySelector("div[style*=\"background-color\"]");
					const stops = stopsElement?.querySelector("span:last-child")?.textContent?.trim().split(" ")[0] ?? "";

					return { number, description, remainingTime: time, stopsLeft: stops };
				});

				setYaklasanBuses(buses);
			}

			if (gecenDiv) {
				const busElements = gecenDiv.querySelectorAll(".row.alert-info");
				const buses: BusInfo[] = Array.from(busElements).map((busElement) => {
					const numberElement = busElement.querySelector("div > span > a");
					const number = numberElement?.textContent?.trim().split("-")[0] ?? "";

					const descriptionElement = busElement.querySelector("div > span > a");
					const description = descriptionElement?.textContent?.trim().split("-").slice(1).join("-") ?? "";

					return { number, description };
				});

				setGecenBuses(buses);
			}

			setErrorMessage("");

		} catch (error: any) {
			setErrorMessage(error?.message);
		} finally {
			setLastUpdateTime(new Date().toTimeString().split(" ")[0]);
			setIsLoading(false); // Set isLoading back to false after data is loaded
		}
	};

	return (
		<div className="container mx-auto max-w-md mt-10">
			<h1 className="text-2xl font-bold mb-4">When Bus</h1>
			<div className="mb-4">
				<label htmlFor="inputNumber" className="block mb-2 text-lg font-medium">
					Enter a station number:
				</label>
				<input
					type="number"
					id="inputNumber"
					className="w-full border border-gray-300 px-3 py-2 rounded"
					value={inputValue}
					onChange={handleInputChange}
				/>
			</div>
			<button
				className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
				onClick={sendPostRequest}
				disabled={isLoading} // Disable button while loading
			>
				{isLoading ? "Loading" : "Send Request"}
			</button>
			{
				errorMessage && (
					<div className="text-sm text-red-600 mt-4">{errorMessage}.</div>
				)
			}
			{
				!errorMessage && lastUpdateTime && (
					<div className="text-sm text-green-600 mt-4">Last Update Time: {lastUpdateTime}</div>
				)
			}
			<div className="mt-4">
				{
					yaklasanBuses.length > 0 && (
						<div>
							<h2 className="text-lg font-bold mb-2">Buses Coming:</h2>
							{yaklasanBuses.map((item, index) => (
								<div key={index} className="border border-gray-300 p-4 rounded mb-4">
									<span className="font-bold">{item.number}</span>
									<span className="block text-sm text-gray-600 capitalize mb-3">{item.description}</span>
									{item.remainingTime && (
										<span className="block text-sm text-gray-600">Remaining Time: {item.remainingTime}
											{item.remainingTime === "1" ? " minute" : " minutes"}
										</span>
									)}
									{item.stopsLeft && (
										<span className="block text-sm text-gray-600">Stops Left: {item.stopsLeft}</span>
									)}
								</div>
							))}
						</div>
					)
				}
				{
					gecenBuses.length > 0 && (
						<div>
							<h2 className="text-lg font-bold mb-2">All Busses:</h2>
							{gecenBuses.map((item, index) => (
								<div key={index} className="border border-gray-300 p-4 rounded mb-4">
									<span className="font-bold">{item.number}</span>
									<span className="block text-sm text-gray-600 capitalize">{item.description}</span>
								</div>
							))}
						</div>
					)
				}
			</div>
		</div>
	);
};

export default App;
