import React from 'react';
import Link from 'next/link';
import './ReportCard.css';

type ReportCardProps = {
    title: string;
    description: string;
    href: string;
    color: 'blue' | 'emerald' | 'red' | 'violet' | 'amber';
    icon: string;
};

const ReportCard = ({ title, description, href, color, icon }: ReportCardProps) => {
    return (
        <Link href={href} className={`report-card report-card--${color}`}>
            <span className="report-card__icon">{icon}</span>
            <h2 className="report-card__title">{title}</h2>
            <p className="report-card__description">{description}</p>
        </Link>
    );
};

export default ReportCard;