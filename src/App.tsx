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

	const [inputValue, setInputValue] = useState("30374");
	const [lastUpdateTime, setLastUpdateTime] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const sendPostRequest = async () => {
		try {
			setIsLoading(true);
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
					const number =
						numberElement?.textContent?.trim().split("-")[0] ?? "";

					const descriptionElement = busElement.querySelector(
						"div > span > a"
					);
					const description =
						descriptionElement?.textContent
							?.trim()
							.split("-")
							.slice(1)
							.join("-") ?? "";

					const timeElement = busElement.querySelector(
						"div[style*=\"background-color\"]"
					);
					const time =
						timeElement?.querySelector("span:first-child")?.textContent?.trim() ??
						"";

					const stopsElement = busElement.querySelector(
						"div[style*=\"background-color\"]"
					);
					const stops =
						stopsElement?.querySelector("span:last-child")?.textContent
							?.trim()
							.split(" ")[0] ?? "";

					return { number, description, remainingTime: time, stopsLeft: stops };
				});

				setYaklasanBuses(buses);
			}

			if (gecenDiv) {
				const busElements = gecenDiv.querySelectorAll(".row.alert-info");
				const buses: BusInfo[] = Array.from(busElements).map((busElement) => {
					const numberElement = busElement.querySelector("div > span > a");
					const number =
						numberElement?.textContent?.trim().split("-")[0] ?? "";

					const descriptionElement = busElement.querySelector(
						"div > span > a"
					);
					const description =
						descriptionElement?.textContent
							?.trim()
							.split("-")
							.slice(1)
							.join("-") ?? "";

					return { number, description };
				});

				setGecenBuses(buses);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLastUpdateTime(new Date().toTimeString().split(" ")[0]);
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto max-w-md mt-10 px-4 bg-black text-zinc-200">
			<h1 className="text-2xl font-bold mb-4 text-center">Ne Zaman Otobüs 🚌 ⏰</h1>
			<div className="mb-4">
				<label
					htmlFor="busNumber"
					className="block mb-2 text-lg font-medium"
				>
					Durak numarasını girin:
				</label>
				<input
					type="text"
					id="busNumber"
					className="w-full border border-zinc-800 bg-zinc-900 text-zinc-200 px-3 py-2 rounded"
					value={inputValue}
					onChange={handleInputChange}
				/>
			</div>
			<button
				className="bg-blue-500 hover:bg-blue-600 text-zinc-200 font-medium py-2 px-4 rounded w-full"
				onClick={sendPostRequest}
				disabled={isLoading}
			>
				{isLoading ? (
					<div className="flex items-center justify-center">
						<span className="mr-2">Yükleniyor</span>
						<svg
							className="animate-spin h-5 w-5 text-zinc-200"
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
				) : (
					"İstek Gönder"
				)}
			</button>
			{lastUpdateTime && (
				<div className="text-sm text-green-600 mt-4 text-center">
					Son Güncelleme Zamanı: {lastUpdateTime}
				</div>
			)}
			<div className="mt-4">
				{yaklasanBuses.length > 0 && (
					<div className="border-t border-zinc-800 pt-4">
						<h2 className="text-lg font-bold mb-4">Yaklaşan Otobüsler</h2>
						{yaklasanBuses.map((item, index) => (
							<div
								key={index}
								className="bg-zinc-900 border border-zinc-800 p-4 rounded mb-4"
							>
								<span className="font-bold text-zinc-200">{item.number}</span>
								<span className="block text-xs text-zinc-300 mb-3">
									{item.description}
								</span>
								{item.remainingTime && (
									<span className="block text-sm text-zinc-300">
										Kalan Süre: {item.remainingTime} Dakika
									</span>
								)}
								{item.stopsLeft && (
									<span className="block text-sm text-zinc-300">
										Kaldığı Durak: {item.stopsLeft}
									</span>
								)}
							</div>
						))}
					</div>
				)}
				{gecenBuses.length > 0 && (
					<div className="border-t border-zinc-800 pt-4">
						<h2 className="text-lg font-bold mb-4">Tüm Otobüsler</h2>
						{gecenBuses.map((item, index) => (
							<div
								key={index}
								className="bg-zinc-900 border border-zinc-800 p-4 rounded mb-4"
							>
								<span className="font-bold text-zinc-200">{item.number}</span>
								<span className="block text-xs text-zinc-300 mb-3">
									{item.description}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
			<div className="text-xs text-center border-t border-zinc-800 pt-4 my-4">
				Bu uygulama Mustafa Yurdakul tarafından yapılmıştır. Kaynak kodlarına <a className="text-blue-600" href="https://github.com/mustafayurdakul/when-bus">GitHub</a> üzerinden ulaşabilirsiniz.
			</div>
		</div>
	);
};

export default App;
