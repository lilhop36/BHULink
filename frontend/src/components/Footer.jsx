import React from "react";
import { FaLink } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<div className="w-full min-h-32  shadow-gray-950 shadow-inner flex flex-col justify-between items-start px-4 py-8 bg-slate-800 text-white">
			<h1 className="font-bold text-lg flex items-center gap-4">
				<span>BHULink</span>
				<FaLink fontSize={16} />
			</h1>
			<div className="flex items-center justify-start w-full p-4 flex-wrap">
				<div className="flex flex-col min-w-[280px] w-[33%] my-3">
					<h1 className="font-semibold mb-2">Contact</h1>
					<span>BHULink Team</span>
					<span>Your Location</span>
					<span>Pincode - Your Code</span>
					<span>
						<Link
							to={"mailto:contact@bhulink.com"}
							target="_blank"
							className="hover:text-blue-600 hover:underline"
						>
							contact@bhulink.com
						</Link>
					</span>
				</div>
				<div className="flex flex-col min-w-[280px] w-[33%] my-3">
					<h1 className="font-semibold mb-2">Pages</h1>
					<span>
						<Link
							className="hover:text-blue-600 hover:underline"
							to={"/"}
						>
							BHULink
						</Link>
					</span>
					<span>
						<Link
							className="hover:text-blue-600 hover:underline"
							to={"/signin"}
						>
							SignIn
						</Link>
					</span>
					<span>
						<Link
							className="hover:text-blue-600 hover:underline"
							to={"/signup"}
						>
							SignUp
						</Link>
					</span>
					<span>
						<Link
							className="hover:text-blue-600 hover:underline"
							to={"/home"}
						>
							Home
						</Link>
					</span>
				</div>
				<div className="flex flex-col min-w-[280px] w-[33%] my-3">
					<h1 className="font-semibold mb-2">Links</h1>
					<span>
						<a
							className="hover:text-blue-600 hover:underline"
							href="https://www.linkedin.com/company/bhulink"
							target="_blank"
							rel="noreferrer"
						>
							LinkedIn
						</a>
					</span>
					<span>
						<a
							className="hover:text-blue-600 hover:underline"
							href="https://github.com/bhulink"
							target="_blank"
							rel="noreferrer"
						>
							Github
						</a>
					</span>
					<span>
						<a
							className="hover:text-blue-600 hover:underline"
							href="https://instagram.com/bhulink"
							target="_blank"
							rel="noreferrer"
						>
							Instagram
						</a>
					</span>
					<span>
						<a
							className="hover:text-blue-600 hover:underline"
							href="mailto:contact@bhulink.com"
							target="_blank"
							rel="noreferrer"
						>
							E-Mail
						</a>
					</span>
				</div>
			</div>
			<h1 className="font-bold">
				All rights reserved 2026 &copy; BHULink
			</h1>
		</div>
	);
};

export default Footer;
