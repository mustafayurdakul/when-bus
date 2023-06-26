import axios from "axios";
import React, { useState } from "react";

interface BusInfo {
	number: string;
	description?: string;
	remainingTime?: string;
	stopsLeft?: string;
}

const App: React.FC = () => {

	const [upcomingBusses, setupcomingBusses] = useState<BusInfo[]>([]);
	const [allBusses, setallBusses] = useState<BusInfo[]>([]);

	const [inputValue, setInputValue] = useState("");
	const [lastUpdateTime, setLastUpdateTime] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const validateInput = () => {
		if (inputValue.length !== 5) {
			return false;
		}
		if (isNaN(Number(inputValue))) {
			return false;
		}
		return true;
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

				setupcomingBusses(buses);
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

				setallBusses(buses);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLastUpdateTime(new Date().toTimeString().split(" ")[0]);
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto max-w-md mt-10 px-4 bg-neutral-950 text-zinc-300">
			<h1 className="text-2xl font-bold my-5 text-center">Ne Zaman Otobüs 🚌 ⏰</h1>
			<div className="mb-4">
				<input
					type="text"
					className="w-full border border-neutral-900 shadow bg-neutral-900 px-3 py-2 rounded"
					value={inputValue}
					placeholder="Durak Numarası (Örn: 30374)"
					onChange={handleInputChange}
				/>
			</div>
			<button
				className="bg-blue-900 hover:bg-blue-800 focus:bg-blue-900 disabled:bg-neutral-900 font-medium py-2 px-4 rounded w-full"
				onClick={sendPostRequest}
				disabled={isLoading || !validateInput()}
			>
				{
					isLoading ? (
						<div className="flex items-center justify-center">
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
					) : (
						"İstek Gönder"
					)
				}
			</button>
			{
				lastUpdateTime !== "" && (upcomingBusses.length > 0 || allBusses.length > 0) && (
					<div className="text-sm text-green-700 mt-4 text-center">
						Son Güncelleme Zamanı: {lastUpdateTime}
					</div>
				)
			}
			<div className="mt-4">
				{
					upcomingBusses.length > 0 && (
						<div className="border-t border-neutral-900 shadow pt-4">
							<h2 className="text-lg font-bold mb-4">Yaklaşan Otobüsler</h2>
							{upcomingBusses.map((item, index) => (
								<div
									key={index}
									className="bg-neutral-900 border border-neutral-900 shadow p-4 rounded mb-4"
								>
									<span className="font-bold ">{item.number}</span>
									<span className="block text-xs  mb-3">
										{item.description}
									</span>
									{
										item.remainingTime && (
											<span className="block text-sm ">
												Kalan Süre: {item.remainingTime} Dakika
											</span>
										)
									}
									{
										item.stopsLeft && (
											<span className="block text-sm ">
												Kaldığı Durak: {item.stopsLeft}
											</span>
										)
									}
								</div>
							))}
						</div>
					)
				}
				{
					allBusses.length > 0 && (
						<div className="border-t border-neutral-900 shadow pt-4">
							<h2 className="text-lg font-bold mb-4">Tüm Otobüsler</h2>
							{
								allBusses.map((item, index) => (
									<div
										key={index}
										className="bg-neutral-900 border border-neutral-900 shadow p-4 rounded mb-4"
									>
										<span className="font-bold">{item.number}</span>
										<span className="block text-xs ">
											{item.description}
										</span>
									</div>
								))
							}
						</div>
					)
				}
				{
					(upcomingBusses.length === 0 && allBusses.length === 0 && lastUpdateTime !== "")
					&& (
						<>
							<div className="text-sm text-center text-red-700 mb-4">
								Veri bulunamadı. Lütfen durak numarasını kontrol edin.
							</div>
							<div className="border-t border-neutral-900 shadow pt-4 my-4">
								<div className="text-xs">
									Durak numarası genellikle 5 haneli bir sayıdır ve duraklarda bulunan numaralı levhalarda yazmaktadır. Durak numarası bilgisine <a className="text-blue-700" href="https://www.kocaeli.bel.tr/tr/main/hatlar">kocaeli.bel.tr</a> sitesinden de ulaşabilirsiniz.
								</div>
							</div>
						</>

					)
				}
			</div>
			<div className="text-xs border-t border-neutral-900 shadow pt-4 my-4">
				Bu uygulama Mustafa Yurdakul tarafından yapılmıştır. Kaynak kodlarına <a className="text-blue-700" href="https://github.com/mustafayurdakul/when-bus">GitHub</a> üzerinden ulaşabilirsiniz.
			</div>
		</div>
	);
};

export default App;
