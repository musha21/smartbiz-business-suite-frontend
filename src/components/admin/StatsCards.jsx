import React from "react";

const StatsCards = ({ stats }) => {
    const cards = [
        { label: "Total Businesses", value: stats.totalBusinesses, color: "bg-blue-500" },
        { label: "Active Businesses", value: stats.activeBusinesses, color: "bg-green-500" },
        { label: "Total Users", value: stats.totalUsers, color: "bg-purple-500" },
        { label: "Invoices This Month", value: stats.invoicesThisMonth, color: "bg-indigo-500" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.highlighted ? "bg-rose-50 border-rose-200 ring-2 ring-rose-500 ring-offset-2" : "bg-white border-slate-200 shadow-sm"
                        } p-6 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md`}
                >
                    <div className="flex items-start justify-between">
                        <span className="text-slate-500 text-sm font-medium">{card.label}</span>
                        <div className={`${card.color} w-8 h-8 rounded-lg flex items-center justify-center bg-opacity-10`}>
                            {/* Simple inline SVG icon */}
                            <svg
                                className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className={`text-2xl font-bold ${card.highlighted ? "text-rose-700" : "text-slate-800"}`}>
                            {card.value}
                        </h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
