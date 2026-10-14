"""
Deterministic seed data generator for the FlowOpt simulated factory.
Provides 5 realistic industrial machines and 15 precision manufacturing jobs.
"""
from typing import List, Tuple
from backend.app.models.schemas import Machine, MachineStatus, Job


def get_default_machines() -> List[Machine]:
    return [
        Machine(
            id="M1",
            name="5-Axis CNC Mill Alpha",
            category="Milling",
            status=MachineStatus.OPERATIONAL,
            efficiency=1.0,
            hourly_rate=145.0
        ),
        Machine(
            id="M2",
            name="CNC Lathe & Turning Center",
            category="Turning",
            status=MachineStatus.OPERATIONAL,
            efficiency=1.0,
            hourly_rate=120.0
        ),
        Machine(
            id="M3",
            name="Industrial Laser Profiler",
            category="Cutting",
            status=MachineStatus.OPERATIONAL,
            efficiency=1.0,
            hourly_rate=110.0
        ),
        Machine(
            id="M4",
            name="Automated Precision Welder",
            category="Welding",
            status=MachineStatus.OPERATIONAL,
            efficiency=1.0,
            hourly_rate=130.0
        ),
        Machine(
            id="M5",
            name="Multi-Axis CNC Mill Beta",
            category="Milling",
            status=MachineStatus.OPERATIONAL,
            efficiency=1.0,
            hourly_rate=150.0
        ),
    ]


def get_default_jobs() -> List[Job]:
    """
    Returns 15 deterministic production jobs.
    Designed with realistic alternative machine routing capabilities,
    due dates, priorities, and dependency chains.
    """
    return [
        # Job 1 - Early milling task on M1
        Job(
            id="JOB-101",
            name="Turbine Blade Roughing",
            part_number="AERO-TB-01",
            customer="AeroTurbine Corp",
            compatible_machines=["M1", "M5"],
            preferred_machine="M1",
            duration_hours=4.0,
            priority=3,
            due_date=10.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 2 - Follow-up finish milling (dependent on JOB-101)
        Job(
            id="JOB-102",
            name="Turbine Blade Aerofoil Finish",
            part_number="AERO-TB-02",
            customer="AeroTurbine Corp",
            compatible_machines=["M1", "M5"],
            preferred_machine="M1",
            duration_hours=3.5,
            priority=4,
            due_date=18.0,
            release_time=0.0,
            predecessor_id="JOB-101"
        ),
        # Job 3 - Turning shaft on M2
        Job(
            id="JOB-103",
            name="Main Drive Shaft Turning",
            part_number="DRV-SH-400",
            customer="Apex Transmissions",
            compatible_machines=["M2"],
            preferred_machine="M2",
            duration_hours=5.0,
            priority=2,
            due_date=14.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 4 - High-Pressure Valve body (runs on M1 or M5)
        Job(
            id="JOB-104",
            name="High-Pressure Valve Manifold",
            part_number="VLV-HP-99",
            customer="Nordic Hydro",
            compatible_machines=["M1", "M5"],
            preferred_machine="M1",
            duration_hours=4.5,
            priority=3,
            due_date=22.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 5 - Laser plate cutting on M3
        Job(
            id="JOB-105",
            name="Chassis Gusset Plate Cutting",
            part_number="CHS-GS-10",
            customer="Titan Heavy Equipment",
            compatible_machines=["M3"],
            preferred_machine="M3",
            duration_hours=3.0,
            priority=2,
            due_date=12.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 6 - Robotic welding (dependent on plate cutting JOB-105)
        Job(
            id="JOB-106",
            name="Subframe Robotic Welding",
            part_number="CHS-WLD-12",
            customer="Titan Heavy Equipment",
            compatible_machines=["M4"],
            preferred_machine="M4",
            duration_hours=4.0,
            priority=3,
            due_date=20.0,
            release_time=0.0,
            predecessor_id="JOB-105"
        ),
        # Job 7 - Precision Lathe job on M2
        Job(
            id="JOB-107",
            name="Hydraulic Actuator Piston Rod",
            part_number="HYD-ROD-88",
            customer="Nordic Hydro",
            compatible_machines=["M2"],
            preferred_machine="M2",
            duration_hours=3.5,
            priority=2,
            due_date=22.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 8 - Laser cutting on M3
        Job(
            id="JOB-108",
            name="Heat Exchanger Baffle Cutting",
            part_number="HEX-BF-24",
            customer="CryoThermal Systems",
            compatible_machines=["M3"],
            preferred_machine="M3",
            duration_hours=4.0,
            priority=2,
            due_date=18.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 9 - Welded manifold on M4
        Job(
            id="JOB-109",
            name="Coolant Rail Seam Welding",
            part_number="COL-RL-05",
            customer="CryoThermal Systems",
            compatible_machines=["M4"],
            preferred_machine="M4",
            duration_hours=3.5,
            priority=2,
            due_date=24.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 10 - Milling job scheduled on M5
        Job(
            id="JOB-110",
            name="Avionics Bracket 5-Axis Pocketing",
            part_number="AVN-BRK-71",
            customer="AeroTurbine Corp",
            compatible_machines=["M1", "M5"],
            preferred_machine="M5",
            duration_hours=3.0,
            priority=4,
            due_date=15.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 11 - Gearbox Housing on M5
        Job(
            id="JOB-111",
            name="Planetary Gearbox Housing",
            part_number="GBX-HS-30",
            customer="Apex Transmissions",
            compatible_machines=["M1", "M5"],
            preferred_machine="M5",
            duration_hours=5.0,
            priority=3,
            due_date=24.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 12 - Heavy Turning on M2
        Job(
            id="JOB-112",
            name="Bull Gear Blank Turning",
            part_number="GBX-BL-33",
            customer="Apex Transmissions",
            compatible_machines=["M2"],
            preferred_machine="M2",
            duration_hours=4.0,
            priority=1,
            due_date=28.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 13 - Laser cut panels on M3
        Job(
            id="JOB-113",
            name="Cabinet Enclosure Sheet Profiling",
            part_number="ENC-SH-102",
            customer="ElectroControl Inc",
            compatible_machines=["M3"],
            preferred_machine="M3",
            duration_hours=3.0,
            priority=1,
            due_date=26.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 14 - Welded frame on M4
        Job(
            id="JOB-114",
            name="Cabinet Tubular Frame Welding",
            part_number="ENC-FR-103",
            customer="ElectroControl Inc",
            compatible_machines=["M4"],
            preferred_machine="M4",
            duration_hours=4.5,
            priority=2,
            due_date=30.0,
            release_time=0.0,
            predecessor_id=None
        ),
        # Job 15 - Titanium Impeller 5-Axis Machining
        Job(
            id="JOB-115",
            name="Titanium Centrifugal Impeller",
            part_number="AERO-IMP-90",
            customer="AeroTurbine Corp",
            compatible_machines=["M1", "M5"],
            preferred_machine="M1",
            duration_hours=4.0,
            priority=4,
            due_date=30.0,
            release_time=0.0,
            predecessor_id=None
        ),
    ]


def get_deterministic_factory_state() -> Tuple[List[Machine], List[Job]]:
    return get_default_machines(), get_default_jobs()
