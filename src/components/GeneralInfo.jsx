import { Phone } from 'lucide-react';
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getMealLabel } from '../utils/mealTypes';

const MotionDiv = motion.div;

const generalInfoStateVariants = {
    hidden: {
        opacity: 0,
        y: 6,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -6,
        transition: {
            duration: 0.18,
            ease: 'easeIn',
        },
    },
};

const managerListVariants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.04,
            staggerChildren: 0.07,
        },
    },
};

const managerItemVariants = {
    hidden: {
        opacity: 0,
        y: 8,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.25,
            ease: 'easeOut',
        },
    },
};

const MealDeadlineSkeleton = () => (
    <div className="tabs tabs-box p-2">
        <p className="skeleton skeleton-text h-10 w-full text-sm font-bold flex items-center justify-center">
            Loading
        </p>
        <p className="skeleton skeleton-text h-14 w-full text-sm font-medium flex items-center justify-center mt-2">
            Loading
        </p>
    </div>
);

const GeneralInfo = ({ managerList, isLoading }) => {
    return (
        <MotionDiv layout className="p-2 overflow-hidden">
            <h2 className="text-3xl py-4 font-black tracking-tight uppercase text-base-content">Managers</h2>
            <MotionDiv
                layout
                className="flex flex-col gap-4 bg-base-200 p-4 rounded-xl overflow-hidden"
                aria-label={isLoading ? 'Loading managers' : undefined}
            >
                <AnimatePresence mode="wait" initial={false}>
                    {!isLoading && managerList?.length > 0 ? (
                        <MotionDiv
                            key="manager-list"
                            layout
                            variants={managerListVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {managerList.map((manager) => (
                                <MotionDiv
                                    layout
                                    variants={managerItemVariants}
                                    key={manager._id || manager.id}
                                    className="w-full duration-300"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className='flex flex-col'>
                                            <div>
                                                <h3 className="uppercase font-black tracking-tight text-base-content/60">
                                                    {manager.name}
                                                </h3>
                                            </div>

                                            <div className="text-sm flex items-center gap-0.5 text-base-content/50">
                                                <span><Phone size={16} /></span>
                                                <span className="font-medium text-center"></span> {manager.mobile}
                                            </div>
                                        </div>
                                    </div>
                                </MotionDiv>
                            ))}
                        </MotionDiv>
                    ) : !isLoading ? (
                        <MotionDiv
                            key="empty"
                            layout
                            variants={generalInfoStateVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-center p-10 text-gray-500 overflow-hidden"
                        >
                            No administrators found.
                        </MotionDiv>
                    ) : null}
                </AnimatePresence>
            </MotionDiv>

            <h2 className="text-3xl tracking-tighter py-4 font-black uppercase text-base-content">Meal Deadlines</h2>
            {/* name of each tab group should be unique */}
            <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                    <MotionDiv
                        key="deadline-loading"
                        layout
                        variants={generalInfoStateVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <MealDeadlineSkeleton />
                    </MotionDiv>
                ) : (
                    <MotionDiv
                        key="deadline-content"
                        layout
                        variants={generalInfoStateVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="tabs tabs-box rounded-2xl p-2">
                            <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={getMealLabel('morning')} defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-200 p-4 mt-2">Previous Day 10 PM</div>

                            <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={getMealLabel('evening')} />
                            <div className="tab-content bg-base-100 border-base-200 p-4 mt-2">Same Day 8 AM</div>

                            <input type="radio" name="my_tabs_6" className="tab font-bold" aria-label={getMealLabel('night')} />
                            <div className="tab-content bg-base-100 border-base-200 p-4 mt-2">Same Day 2 PM</div>
                        </div>
                    </MotionDiv>
                )}
            </AnimatePresence>
        </MotionDiv>
    );
};

export default GeneralInfo;
