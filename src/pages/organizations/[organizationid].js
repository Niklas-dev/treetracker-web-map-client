import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Box, Divider, Grid, Typography } from '@mui/material';
import log from 'loglevel';
import React from 'react';
import CustomWorldMap from 'components/CustomWorldMap';
import PlanterQuote from 'components/PlanterQuote';
import TreeSpeciesCard from 'components/TreeSpeciesCard';
import { makeStyles } from 'models/makeStyles';
import PageWrapper from '../../components/PageWrapper';
import VerifiedBadge from '../../components/VerifiedBadge';
import CustomCard from '../../components/common/CustomCard';
// import placeholder from '../../images/organizationsPlaceholder.png';
import { useMapContext } from '../../mapContext';
import * as utils from '../../models/utils';

const useStyles = makeStyles()((theme) => ({
  info: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontFamily: theme.typography.fontFamily,
    fontSize: '0.8rem',
    color: theme.palette.textSecondary.main,
    margin: '4px 0',
  },
  badgeWrapper: {
    marginBottom: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(1),
  },
  imgContainer: {
    borderRadius: '16px',
    position: 'relative',
    img: {
      borderRadius: '16px',
    },
    marginBottom: theme.spacing(4),
    '&> img': {
      width: '100%',
      height: '100%',
    },
  },
  logoContainer: {
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    left: theme.spacing(4),
    bottom: theme.spacing(4),
    boxSizing: 'border-box',
    padding: theme.spacing(5),
    width: 108,
    height: 108,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&> img': {
      width: '100%',
    },
  },
  divider: {
    marginTop: theme.spacing(20),
    marginBottom: theme.spacing(20),
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(14),
      marginBottom: theme.spacing(14),
    },
  },
  textColor: {
    color: theme.palette.textPrimary.main,
  },
}));

export default function Organization({ organization }) {
  const mapContext = useMapContext();
  const { classes } = useStyles();
  const [isPlanterTab, setIsPlanterTab] = React.useState(false);
  // eslint-disable-next-line
  const [continent, setContinent] = React.useState(null);
  const {
    name,
    area,
    country,
    created_at,
    about,
    mission,
    photo_url,
    logo_url,
  } = organization;

  async function updateContinent() {
    const tree = organization?.featuredTrees?.trees[0];
    if (tree) {
      const { lat, lon } = tree;
      const newContinent = await utils.getContinent(lat, lon);
      setContinent(newContinent.name);
    }
  }

  React.useEffect(() => {
    async function reload() {
      // manipulate the map
      const { map } = mapContext;
      if (map && organization) {
        // map.flyTo(tree.lat, tree.lon, 16);
        map.setFilters({
          map_name: organization.name,
        });
        // TODO why I must try/catche this?
        try {
          await map.loadInitialView();
          map.rerender();
        } catch (e) {
          log.error('rendering map:', e);
        }
      } else {
        log.warn('no data:', map, organization);
      }
    }
    reload();

    updateContinent();
  }, [mapContext.map]);

  function handleCardClick() {
    setIsPlanterTab(!isPlanterTab);
  }

  return (
    <PageWrapper>
      <Typography variant="subtitle1">{name}</Typography>
      <Box className={classes.badgeWrapper}>
        <VerifiedBadge verified badgeName="Verified Planter" />
        <VerifiedBadge verified={false} badgeName="Seeking Planters" />
      </Box>
      <Box className={classes.info}>
        <CalendarTodayIcon fontSize="small" />
        Planter since {created_at}
      </Box>
      <Box className={classes.info}>
        <LocationOnIcon fontSize="small" />
        {area}, {country}
      </Box>
      <Divider variant="fullWidth" sx={{ mt: 6, mb: 9.5 }} />

      <Box className={classes.imgContainer}>
        <img src={photo_url} />
        <Box className={classes.logoContainer}>
          <img src={logo_url} />
        </Box>
      </Box>
      <Grid
        container
        wrap="nowrap"
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Grid item sx={{ width: '49%' }}>
          <CustomCard
            handleClick={handleCardClick}
            icon={<ParkOutlinedIcon fontSize="large" />}
            title="Trees Planted"
            text={organization?.featuredTrees?.total}
            disabled={isPlanterTab}
          />
        </Grid>
        <Grid item sx={{ width: '49%' }}>
          <CustomCard
            handleClick={handleCardClick}
            icon={<PersonOutlineIcon fontSize="large" />}
            title="Hired Planters"
            text={organization?.associatedPlanters?.total}
            disabled={!isPlanterTab}
          />
        </Grid>
      </Grid>

      {/* <Grid container spacing={1}>
        <Grid item>
          <CustomCard
            handleClick={handleCardClick}
            icon={<ParkOutlinedIcon />}
            title="Trees Planted"
            text={organization?.featuredTrees?.total}
            disabled={!!isPlanterTab}
          />
        </Grid>
        <Grid item>
          <Box width={8} />
        </Grid>
        <Grid item>
          <CustomCard
            handleClick={handleCardClick}
            icon={<GroupsOutlinedIcon />}
            title="Associated Organizations"
            text={organization?.associatedPlanters?.total}
            disabled={!isPlanterTab}
          />
        </Grid>
      </Grid> */}
      {!isPlanterTab && (
        <Box>
          <CustomWorldMap totalTrees={organization?.featuredTrees?.total} />
        </Box>
      )}
      {isPlanterTab && (
        <div>
          {organization?.associatedPlanters?.planters?.map((planter) => (
            <PlanterQuote
              name={planter.first_name}
              key={planter.id}
              quote={planter.about.slice(0, 150)}
              photo={planter.photo_url}
              initialDate={planter.created_time}
              location={planter.country}
            />
          ))}
        </div>
      )}
      <Box className={classes.speciesBox}>
        {organization?.species.species.map((species) => (
          <TreeSpeciesCard
            key={species.id}
            name={species.name}
            scientificName={species.scientificName}
            count={species.count}
          />
        ))}
      </Box>
      <Typography
        variant="h4"
        className={classes.textColor}
        sx={{ mt: { xs: 12, md: 20 }, fontWeight: 600 }}
      >
        About the Organization
      </Typography>
      <Typography variant="body1" className={classes.textColor} mt={7}>
        {about}
      </Typography>
      <br />
      <Typography
        variant="h4"
        className={classes.textColor}
        sx={{ mt: { xs: 10, md: 16 }, fontWeight: 600 }}
      >
        Mission
      </Typography>
      <Typography variant="body1" className={classes.textColor} mt={7}>
        {mission}
      </Typography>
      <Divider varian="fullwidth" className={classes.divider} />
      <Typography
        variant="h4"
        className={classes.textColor}
        sx={{ mt: { xs: 10, md: 16 }, fontWeight: 600 }}
      >
        Check out the planting effort in action
      </Typography>
    </PageWrapper>
  );
}

export async function getServerSideProps({ params }) {
  const url = `${process.env.NEXT_PUBLIC_API_NEW}/organizations/${params.organizationid}`;
  const res = await fetch(url);
  const organization = await res.json();
  const props = { organization };

  {
    const { featured_trees, associated_planters, species } =
      props.organization.links;
    props.organization.featuredTrees = await utils.requestAPI(featured_trees);
    props.organization.associatedPlanters = await utils.requestAPI(
      associated_planters,
    );
    props.organization.species = await utils.requestAPI(species);
    log.warn(
      'get trees: %d, planters: %d, species: %d',
      props.organization.featuredTrees.total,
      props.organization.associatedPlanters.total,
      props.organization.species.total,
    );
  }

  return {
    props: {
      organization,
    },
  };
}
